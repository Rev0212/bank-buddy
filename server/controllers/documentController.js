const Document = require('../models/documentModel');
const Loan = require('../models/loanModel');
const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { uploadDocument } = require('../middleware/upload');

// @desc    Upload document
// @route   POST /api/document
// @access  Private
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  uploadDocument(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Error uploading file: ${err.message}`, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const { documentType, documentNumber, loanId } = req.body;

    // Check if loan exists if loanId is provided
    if (loanId) {
      const loan = await Loan.findById(loanId);
      if (!loan) {
        return next(new ErrorResponse(`No loan found with id of ${loanId}`, 404));
      }

      // Make sure user owns the loan
      if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to upload documents for this loan`, 403));
      }
    }

    // Create document
    const document = await Document.create({
      user: req.user.id,
      loan: loanId || null,
      documentType,
      documentNumber,
      filePath: req.file.path,
      fileType: req.file.mimetype
    });

    // Process document with AI service
    try {
      const formData = new FormData();
      formData.append('document', fs.createReadStream(req.file.path));
      formData.append('doc_type', documentType);

      const aiResponse = await axios.post(
        `${process.env.AI_SERVICES_URL}/api/verify-document`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          }
        }
      );

      // Update document with AI verification results
      document.verificationDetails = {
        aiVerificationScore: aiResponse.data.confidence,
        aiVerificationDetails: {
          documentAuthenticity: aiResponse.data.confidence,
          extractedInformation: aiResponse.data.extracted_data
        }
      };

      await document.save();

      // Update loan if document is verified and loan exists
      if (loanId && aiResponse.data.verified && aiResponse.data.confidence > 0.7) {
        await Loan.findByIdAndUpdate(loanId, {
          documentsSubmitted: true,
          $inc: { applicationProgress: 5 } // Increment progress
        });
      }
    } catch (error) {
      console.error('AI document verification error:', error);
      // Continue without AI verification if it fails
    }

    res.status(201).json({
      success: true,
      data: document
    });
  });
});

// @desc    Get all documents
// @route   GET /api/document
// @access  Private
exports.getDocuments = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role !== 'admin') {
    // Regular users can only see their own documents
    query = Document.find({ user: req.user.id });
  } else {
    // Admins can see all documents
    query = Document.find();
  }

  // Filter by loan if provided
  if (req.query.loan) {
    query = query.where('loan').equals(req.query.loan);
  }

  // Filter by document type if provided
  if (req.query.documentType) {
    query = query.where('documentType').equals(req.query.documentType);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-uploadDate');
  }

  // Execute query
  const documents = await query;

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents
  });
});

// @desc    Get single document
// @route   GET /api/document/:id
// @access  Private
exports.getDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`No document found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the document or is admin
  if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this document`, 403));
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Update document verification status (admin only)
// @route   PUT /api/document/:id/verify
// @access  Private/Admin
exports.verifyDocument = asyncHandler(async (req, res, next) => {
  const { verificationStatus, notes } = req.body;

  // Check if status is valid
  const validStatuses = ['Pending', 'Verified', 'Rejected', 'Needs Clarification'];
  if (!validStatuses.includes(verificationStatus)) {
    return next(new ErrorResponse(`Invalid verification status`, 400));
  }

  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`No document found with id of ${req.params.id}`, 404));
  }

  // Only admin can verify documents
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to verify documents`, 403));
  }

  // Update verification status
  document.verificationStatus = verificationStatus;
  document.verificationDetails.verifiedBy = req.user.id;
  document.verificationDetails.verifiedAt = Date.now();
  document.verificationDetails.notes = notes || '';

  await document.save();

  // Update loan documents status if all required documents are verified
  if (document.loan) {
    const loan = await Loan.findById(document.loan);
    if (loan) {
      const allDocuments = await Document.find({ loan: document.loan });
      const allVerified = allDocuments.every(doc => doc.verificationStatus === 'Verified');
      
      if (allVerified && allDocuments.length >= 3) { // Assuming minimum 3 documents required
        loan.documentsSubmitted = true;
        await loan.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Delete document
// @route   DELETE /api/document/:id
// @access  Private
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`No document found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the document or is admin
  if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this document`, 403));
  }

  // Remove file from storage
  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  await document.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});