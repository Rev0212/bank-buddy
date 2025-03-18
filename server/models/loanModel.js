const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    required: [true, 'Please specify loan type'],
    enum: [
      'Personal Loan',
      'Home Loan',
      'Car Loan',
      'Education Loan',
      'Business Loan',
      'Gold Loan'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Please specify loan amount']
  },
  tenure: {
    type: Number,
    required: [true, 'Please specify loan tenure in months']
  },
  interestRate: {
    type: Number,
    required: [true, 'Please specify interest rate']
  },
  emi: {
    type: Number
  },
  purpose: {
    type: String,
    required: [true, 'Please specify loan purpose']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'documents_required', 'approved', 'rejected'],
    default: 'pending'
  },
  statusRemarks: String,
  statusUpdatedAt: Date,
  statusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicationProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  documentsSubmitted: {
    type: Boolean,
    default: false
  },
  videoInterviewCompleted: {
    type: Boolean,
    default: false
  },
  coApplicant: {
    name: String,
    relationship: String,
    income: Number,
    contact: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  guarantor: {
    name: String,
    relationship: String,
    contact: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  employmentDetails: {
    employerName: String,
    designation: String,
    employmentType: {
      type: String,
      enum: ['Salaried', 'Self-employed', 'Business Owner', 'Freelancer', 'Retired', 'Unemployed']
    },
    monthlySalary: Number,
    employmentDuration: Number // in months
  },
  disbursementDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    disbursementDate: Date,
    disbursementAmount: Number,
    transactionId: String
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

// Calculate application progress based on completed steps
LoanSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Calculate application progress
  let progress = 10; // Initial application created
  
  if (this.documentsSubmitted) progress += 30;
  if (this.videoInterviewCompleted) progress += 30;
  
  // Status based progress
  if (this.status === 'processing') progress += 10;
  if (this.status === 'approved' || this.status === 'rejected') progress = 100;
  
  this.applicationProgress = progress;
  
  next();
});

module.exports = mongoose.model('Loan', LoanSchema);