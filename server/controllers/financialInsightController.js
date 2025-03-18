const FinancialInsight = require('../models/financialInsightModel');
const Loan = require('../models/loanModel');
const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's financial insights
// @route   GET /api/financial-insight/:userId
// @access  Private
exports.getUserFinancialInsights = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Check if user has permission to access this data
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to access this user's financial insights`, 403)
    );
  }
  
  // Find existing insights or create new ones
  let insights = await FinancialInsight.findOne({ user: userId });
  
  if (!insights) {
    // Get user's loans and financial data
    const loans = await Loan.find({ user: userId });
    const user = await User.findById(userId);
    
    // Create basic financial insights
    insights = await FinancialInsight.create({
      user: userId,
      financialProfile: {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsPotential: 0
      },
      creditProfile: {
        creditScore: user.creditScore || 0,
        lastUpdated: Date.now()
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: insights
  });
});

// @desc    Update financial insights
// @route   PUT /api/financial-insight/:userId
// @access  Private
exports.updateFinancialInsights = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Check if user has permission to update this data
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to update this user's financial insights`, 403)
    );
  }
  
  // Find existing insights or create new ones
  let insights = await FinancialInsight.findOneAndUpdate(
    { user: userId },
    req.body,
    { new: true, upsert: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: insights
  });
});

// @desc    Generate loan recommendations
// @route   GET /api/financial-insight/:userId/loan-recommendations
// @access  Private
exports.getLoanRecommendations = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Check if user has permission to access this data
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to access this user's loan recommendations`, 403)
    );
  }
  
  // Get user's financial profile
  const insights = await FinancialInsight.findOne({ user: userId });
  const user = await User.findById(userId);
  
  if (!insights || !insights.financialProfile) {
    return next(
      new ErrorResponse(`Financial profile not found. Please update your financial details first.`, 404)
    );
  }
  
  // Generate loan recommendations based on financial profile
  const recommendations = [
    {
      loanType: 'Personal Loan',
      eligibleAmount: insights.financialProfile.monthlyIncome * 10,
      interestRate: 12.5,
      tenure: 36,
      emi: (insights.financialProfile.monthlyIncome * 10 * 0.0125 * Math.pow(1.0125, 36)) / (Math.pow(1.0125, 36) - 1),
      features: ['No collateral required', 'Quick approval', 'Flexible usage'],
      suitabilityScore: 85
    },
    {
      loanType: 'Home Loan',
      eligibleAmount: insights.financialProfile.monthlyIncome * 60,
      interestRate: 8.5,
      tenure: 240,
      emi: (insights.financialProfile.monthlyIncome * 60 * 0.00708 * Math.pow(1.00708, 240)) / (Math.pow(1.00708, 240) - 1),
      features: ['Low interest rate', 'Tax benefits', 'Long repayment period'],
      suitabilityScore: 75
    }
  ];
  
  // Update insights with recommendations
  insights.loanRecommendations = recommendations;
  await insights.save();
  
  res.status(200).json({
    success: true,
    data: recommendations
  });
});