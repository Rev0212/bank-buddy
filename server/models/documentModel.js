const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  },
  documentType: {
    type: String,
    required: [true, 'Please specify document type'],
    enum: [
      'Aadhaar Card', 
      'PAN Card', 
      'Salary Slip', 
      'Bank Statement', 
      'Employment Proof',
      'Address Proof',
      'Photo ID',
      'Income Tax Return',
      'Property Document',
      'Business Proof'
    ]
  },
  documentNumber: {
    type: String,
    required: [true, 'Please provide the document number']
  },
  filePath: {
    type: String,
    required: [true, 'Document file path is required']
  },
  fileType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Needs Clarification'],
    default: 'Pending'
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String,
    aiVerificationScore: Number,
    aiVerificationDetails: {
      nameMatch: Boolean,
      addressMatch: Boolean,
      documentAuthenticity: Number, // Score between 0-1
      photoMatch: Boolean,
      extractedInformation: {
        name: String,
        dob: Date,
        number: String,
        address: String,
        issueDate: Date,
        expiryDate: Date,
        additionalDetails: Object
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Document', DocumentSchema);