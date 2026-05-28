const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  examName: {
    type: String,
    required: true,
    enum: ['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'KCET/KPSE', 'Banking', 'SSC', 'Railway', 'CAT', 'GATE', 'CUET', 'NDA', 'CLAT']
  },
  subject: String,
  topic: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  totalQuestions: Number,
  duration: Number, // in minutes
  passingScore: Number, // percentage
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
