const Loan = require('../models/loanModel');
const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new loan application
// @route   POST /api/loan
// @access  Private
exports.createLoan = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Calculate EMI based on loan amount, interest rate, and tenure
  const { amount, interestRate, tenure } = req.body;
  const r = interestRate / (12 * 100); // monthly interest rate
  const n = tenure; // number of months
  const emi = amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  
  req.body.emi = Math.round(emi * 100) / 100;

  const loan = await Loan.create(req.body);

  res.status(201).json({
    success: true,
    data: loan
  });
});

// @desc    Get all loan applications (with various filters)
// @route   GET /api/loan
// @access  Private/Admin
exports.getLoans = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Find resources
  if (req.user.role !== 'admin') {
    query = Loan.find({ user: req.user.id, ...JSON.parse(queryStr) });
  } else {
    query = Loan.find(JSON.parse(queryStr));
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Loan.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate user data
  query = query.populate({
    path: 'user',
    select: 'name email phone'
  });

  // Execute query
  const loans = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: loans.length,
    pagination,
    data: loans
  });
});

// @desc    Get single loan
// @route   GET /api/loan/:id
// @access  Private
exports.getLoan = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id).populate({
    path: 'user',
    select: 'name email phone'
  });

  if (!loan) {
    return next(
      new ErrorResponse(`No loan found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is loan owner or admin
  if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this loan`,
        403
      )
    );
  }

  res.status(200).json({
    success: true,
    data: loan
  });
});

// @desc    Update loan
// @route   PUT /api/loan/:id
// @access  Private
exports.updateLoan = asyncHandler(async (req, res, next) => {
  let loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(
      new ErrorResponse(`No loan found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is loan owner or admin
  if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this loan`,
        403
      )
    );
  }

  // Cannot update if loan is already approved or rejected
  if (['approved', 'rejected'].includes(loan.status) && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Cannot update loan with status: ${loan.status}`, 400)
    );
  }

  loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: loan
  });
});

// @desc    Delete loan
// @route   DELETE /api/loan/:id
// @access  Private
exports.deleteLoan = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(
      new ErrorResponse(`No loan found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is loan owner or admin
  if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this loan`,
        403
      )
    );
  }

  // Cannot delete if loan is already approved
  if (loan.status === 'approved' && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Cannot delete an approved loan`, 400)
    );
  }

  await loan.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Check loan eligibility
// @route   POST /api/loan/check-eligibility
// @access  Private
exports.checkEligibility = asyncHandler(async (req, res, next) => {
  const { income, creditScore, existingLoans, loanAmount, tenure } = req.body;
  
  // Get user details
  const user = await User.findById(req.user.id);
  
  // Calculate debt-to-income ratio (DTI)
  const totalMonthlyDebt = existingLoans.reduce((total, loan) => total + loan.monthlyPayment, 0);
  const dti = totalMonthlyDebt / income;
  
  // Calculate EMI for requested loan
  const interestRate = 10; // Default interest rate 10%
  const r = interestRate / (12 * 100);
  const n = tenure;
  const emi = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  
  // Calculate new DTI with the new loan
  const newDti = (totalMonthlyDebt + emi) / income;
  
  // Check eligibility criteria
  let isEligible = true;
  let maxLoanAmount = loanAmount;
  const reasons = [];
  
  // Credit score check
  if (creditScore < 650) {
    isEligible = false;
    reasons.push('Credit score below minimum requirement (650)');
  }
  
  // DTI check - should not exceed 50%
  if (newDti > 0.5) {
    isEligible = false;
    reasons.push('Debt-to-income ratio would exceed 50% with this loan');
    
    // Calculate maximum eligible loan amount
    const maxEmi = (0.5 * income) - totalMonthlyDebt;
    if (maxEmi > 0) {
      maxLoanAmount = maxEmi * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
      maxLoanAmount = Math.floor(maxLoanAmount);
    } else {
      maxLoanAmount = 0;
    }
  }
  
  // Income check - minimum income requirement
  const minIncome = 20000; // ₹20,000 minimum income
  if (income < minIncome) {
    isEligible = false;
    reasons.push(`Income below minimum requirement (₹${minIncome})`);
  }
  
  res.status(200).json({
    success: true,
    data: {
      isEligible,
      maxLoanAmount,
      reasons,
      creditScore,
      dti: newDti.toFixed(2),
      estimatedEmi: Math.round(emi)
    }
  });
});

// @desc    Update loan status
// @route   PUT /api/loan/:id/status
// @access  Private/Admin
exports.updateLoanStatus = asyncHandler(async (req, res, next) => {
  const { status, remarks } = req.body;
  
  // Check if status is valid
  const validStatuses = ['pending', 'processing', 'documents_required', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status: ${status}`, 400));
  }
  
  const loan = await Loan.findById(req.params.id);
  
  if (!loan) {
    return next(new ErrorResponse(`No loan found with id of ${req.params.id}`, 404));
  }
  
  // Only admin can update loan status
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update loan status`, 403));
  }
  
  // Update loan status and remarks
  loan.status = status;
  loan.statusRemarks = remarks || '';
  loan.statusUpdatedAt = Date.now();
  loan.statusUpdatedBy = req.user.id;
  
  await loan.save();
  
  res.status(200).json({
    success: true,
    data: loan
  });
});
