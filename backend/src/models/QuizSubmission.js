const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  selectedOption: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const quizSubmissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  answers: [quizAnswerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  xpEarned: {
    type: Number,
    min: 0,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

quizSubmissionSchema.index({ quizId: 1, studentId: 1 });
quizSubmissionSchema.index({ studentId: 1, 'createdAt': -1 });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);

