const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: String
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // or Teacher
    required: true
  },
  questions: [quizQuestionSchema],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

quizSchema.index({ courseId: 1, creator: 1 });
quizSchema.index({ 'status': 1 });

module.exports = mongoose.model('Quiz', quizSchema);

