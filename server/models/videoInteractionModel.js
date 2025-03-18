const mongoose = require('mongoose');

const VideoInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    videoPromptUrl: String, // Path to the AI video: /videos/prompts/video1.mp4
    language: {
      type: String,
      default: 'English'
    },
    category: String, // E.g., "Income Verification", "Loan Purpose", etc.
    responseVideoUrl: String,
    responseText: String, // transcribed from video
    answerAnalysis: {
      sentiment: {
        score: Number, // between -1 and 1
        magnitude: Number
      },
      confidence: Number, // between 0 and 1
      keywords: [String],
      entities: [{
        name: String,
        type: String,
        salience: Number
      }]
    },
    isAnswered: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  overallAnalysis: {
    trustScore: Number,
    confidenceScore: Number,
    consistencyScore: Number,
    emotionalState: String,
    potentialFraudIndicators: [String],
    keyTakeaways: [String]
  },
  completionStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned'],
    default: 'Not Started'
  },
  livenessCheckPassed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('VideoInteraction', VideoInteractionSchema);