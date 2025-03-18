const VideoInteraction = require('../models/videoInteractionModel');
const Loan = require('../models/loanModel');
const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadVideo } = require('../middleware/upload');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// @desc    Create new video interaction session
// @route   POST /api/video-interaction
// @access  Private
exports.createVideoInteractionSession = asyncHandler(async (req, res, next) => {
  const { loanId } = req.body;

  // Check if loan exists
  const loan = await Loan.findById(loanId);
  if (!loan) {
    return next(new ErrorResponse(`No loan found with id of ${loanId}`, 404));
  }

  // Make sure user owns the loan
  if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to create session for this loan`, 403));
  }

  // Check if session already exists
  const existingSession = await VideoInteraction.findOne({ loan: loanId, user: req.user.id });
  if (existingSession) {
    return res.status(200).json({
      success: true,
      data: existingSession
    });
  }

  // Define questions based on loan type
  const questions = [];
  
  // Basic questions for all loans
  questions.push({
    questionId: 'q1',
    questionText: 'Please introduce yourself and tell us about your profession.',
    videoPromptUrl: '/videos/prompts/introduction.mp4',
    language: req.user.preferredLanguage || 'English',
    isAnswered: false
  });
  
  questions.push({
    questionId: 'q2',
    questionText: 'What is the purpose of your loan application?',
    videoPromptUrl: '/videos/prompts/purpose.mp4',
    language: req.user.preferredLanguage || 'English',
    isAnswered: false
  });
  
  // Add loan-specific questions
  if (loan.loanType === 'Personal Loan') {
    questions.push({
      questionId: 'q3',
      questionText: 'How do you plan to repay this loan?',
      videoPromptUrl: '/videos/prompts/personal_repayment.mp4',
      language: req.user.preferredLanguage || 'English',
      isAnswered: false
    });
  } else if (loan.loanType === 'Business Loan') {
    questions.push({
      questionId: 'q3',
      questionText: 'Tell us about your business and how long you have been operating.',
      videoPromptUrl: '/videos/prompts/business_details.mp4',
      language: req.user.preferredLanguage || 'English',
      isAnswered: false
    });
    
    questions.push({
      questionId: 'q4',
      questionText: 'How will this loan help grow your business?',
      videoPromptUrl: '/videos/prompts/business_growth.mp4',
      language: req.user.preferredLanguage || 'English',
      isAnswered: false
    });
  }
  
  // Create a new session
  const videoInteraction = await VideoInteraction.create({
    user: req.user.id,
    loan: loanId,
    sessionId: uuidv4(),
    questions,
    completionStatus: 'Not Started'
  });

  res.status(201).json({
    success: true,
    data: videoInteraction
  });
});

// @desc    Upload video response
// @route   POST /api/video-interaction/:sessionId/question/:questionId
// @access  Private
exports.uploadVideoResponse = asyncHandler(async (req, res, next) => {
  uploadVideo(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Error uploading video: ${err.message}`, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a video', 400));
    }

    const { sessionId, questionId } = req.params;

    // Find the video interaction session
    const session = await VideoInteraction.findOne({ sessionId });

    if (!session) {
      return next(new ErrorResponse(`No session found with id ${sessionId}`, 404));
    }

    // Make sure user owns the session
    if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to upload to this session`, 403));
    }

    // Find the question
    const question = session.questions.find(q => q.questionId === questionId);
    if (!question) {
      return next(new ErrorResponse(`Question not found with id ${questionId}`, 404));
    }

    // Update question with video response
    question.responseVideoUrl = req.file.path;
    question.isAnswered = true;
    question.timestamp = Date.now();

    // Process video with AI service
    try {
      // First convert video to audio
      const audioFilePath = path.join(
        path.dirname(req.file.path),
        `${path.basename(req.file.path, path.extname(req.file.path))}.wav`
      );
      
      // This would typically use ffmpeg to extract audio, but we'll skip the actual conversion here
      
      // Send audio to speech-to-text service
      const formData = new FormData();
      formData.append('audio_file', fs.createReadStream(audioFilePath));
      
      const speechResponse = await axios.post(
        `${process.env.AI_SERVICES_URL}/api/speech-to-text`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          }
        }
      );
      
      const transcribedText = speechResponse.data.text;
      question.responseText = transcribedText;
      
      // Analyze sentiment and extract entities
      const sentimentResponse = await axios.post(
        `${process.env.AI_SERVICES_URL}/api/analyze-sentiment`,
        { text: transcribedText },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update question with analysis
      question.answerAnalysis = {
        sentiment: {
          score: sentimentResponse.data.score,
          magnitude: sentimentResponse.data.magnitude
        },
        confidence: speechResponse.data.confidence,
        keywords: [], // Would be extracted from NLP service
        entities: []  // Would be extracted from NLP service
      };
    } catch (error) {
      console.error('Video processing error:', error);
      // Continue without AI processing if it fails
    }

    // Update session status
    const allAnswered = session.questions.every(q => q.isAnswered);
    
    if (allAnswered) {
      session.completionStatus = 'Completed';
    } else {
      session.completionStatus = 'In Progress';
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  });
});

// @desc    Get video interaction session
// @route   GET /api/video-interaction/:sessionId
// @access  Private
exports.getVideoInteractionSession = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await VideoInteraction.findOne({ sessionId });

  if (!session) {
    return next(new ErrorResponse(`No session found with id ${sessionId}`, 404));
  }

  // Make sure user owns the session
  if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this session`, 403));
  }

  res.status(200).json({
    success: true,
    data: session
  });
});

// @desc    Get next question
// @route   GET /api/video-interaction/:sessionId/next-question
// @access  Private
exports.getNextQuestion = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await VideoInteraction.findOne({ sessionId });

  if (!session) {
    return next(new ErrorResponse(`No session found with id ${sessionId}`, 404));
  }

  // Make sure user owns the session
  if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this session`, 403));
  }

  // Find the first unanswered question
  const nextQuestion = session.questions.find(q => !q.isAnswered);

  if (!nextQuestion) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'All questions have been answered'
    });
  }

  res.status(200).json({
    success: true,
    data: nextQuestion
  });
});

// @desc    Complete video interaction session
// @route   PUT /api/video-interaction/:sessionId/complete
// @access  Private
exports.completeVideoInteractionSession = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await VideoInteraction.findOne({ sessionId });

  if (!session) {
    return next(new ErrorResponse(`No session found with id ${sessionId}`, 404));
  }

  // Make sure user owns the session
  if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this session`, 403));
  }

  // Check if all questions are answered
  const allAnswered = session.questions.every(q => q.isAnswered);
  
  if (!allAnswered) {
    return next(new ErrorResponse('Cannot complete session until all questions are answered', 400));
  }

  session.completionStatus = 'Completed';
  session.completedAt = Date.now();
  
  await session.save();

  // Update loan application status
  const loan = await Loan.findById(session.loan);
  if (loan) {
    loan.videoVerificationStatus = 'Completed';
    await loan.save();
  }

  res.status(200).json({
    success: true,
    data: session
  });
});