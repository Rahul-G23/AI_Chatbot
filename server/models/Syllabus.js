const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
    enum: ['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'KCET/KPSE', 'Banking', 'SSC', 'Railway', 'CAT', 'GATE', 'CUET', 'NDA', 'CLAT']
  },
  subject: {
    type: String,
    required: true
  },
  unit: String,
  chapter: {
    type: String,
    required: true
  },
  topics: [{
    name: String,
    subtopics: [String],
    weightage: Number,
    importance: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    previousYearFrequency: Number,
    keyFormulas: [String],
    keyPoints: [String],
    relatedTopics: [String]
  }],
  totalQuestions: Number,
  estimatedHours: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
