const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MCQ', 'Numerical', 'Assertion/Reason', 'Match the Following', 'Short Answer'],
    required: true
  },
  statement: {
    type: String,
    required: true
  },
  subject: String,
  topic: String,
  examName: String,
  
  // For MCQ
  options: [String],
  correctOption: Number,
  
  // For Numerical
  correctAnswer: Number,
  tolerance: Number, // acceptable range
  
  // For Assertion/Reason
  assertion: String,
  reason: String,
  
  // For Match the Following
  matchPairs: [{
    left: String,
    right: String
  }],
  
  // Common properties
  explanation: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  marks: {
    type: Number,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
  },
  solutionVideo: String,
  relatedConcept: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
