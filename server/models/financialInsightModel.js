const mongoose = require('mongoose');

const FinancialInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  },
  financialProfile: {
    monthlyIncome: Number,
    monthlyExpenses: Number,
    savingsPotential: Number,
    existingLoans: [{
      loanType: String,
      outstandingAmount: Number,
      emi: Number,
      interestRate: Number,
      remainingTenure: Number
    }],
    investmentProfile: {
      riskAppetite: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
      },
      currentInvestments: {
        equity: Number,
        debt: Number,
        realEstate: Number,
        gold: Number,
        fixedDeposits: Number,
        other: Number
      }
    }
  },
  creditProfile: {
    creditScore: Number,
    lastUpdated: Date,
    factors: {
      paymentHistory: Number, // percentage
      creditUtilization: Number, // percentage
      creditAge: Number, // months
      creditMix: {
        type: String,
        enum: ['Poor', 'Fair', 'Good', 'Excellent'],
        default: 'Fair'
      },
      recentInquiries: Number
    },
    recommendationsToImprove: [String]
  },
  loanRecommendations: [{
    loanType: String,
    eligibleAmount: Number,
    interestRate: Number,
    tenure: Number,
    emi: Number,
    features: [String],
    suitabilityScore: Number // 0-100
  }],
  savingsRecommendations: [{
    strategy: String,
    potentialSavings: Number,
    implementationSteps: [String],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  }],
  spendingInsights: {
    topCategories: [{
      category: String,
      percentage: Number,
      amount: Number,
      trend: {
        type: String,
        enum: ['Increasing', 'Decreasing', 'Stable'],
        default: 'Stable'
      }
    }],
    unusualSpending: [{
      category: String,
      amount: Number,
      percentageChange: Number,
      date: Date
    }],
    recommendedBudget: [{
      category: String,
      recommendedAmount: Number,
      currentAmount: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
FinancialInsightSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FinancialInsight', FinancialInsightSchema);