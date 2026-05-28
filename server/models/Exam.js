const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'KCET/KPSE', 'Banking', 'SSC', 'Railway', 'CAT', 'GATE', 'CUET', 'NDA', 'CLAT'],
    unique: true
  },
  description: String,
  conductedBy: String,
  applicationDeadline: Date,
  admitCardDate: Date,
  examDate: Date,
  resultDate: Date,
  eligibility: {
    educationQualification: String,
    ageLimit: String,
    citizenship: String
  },
  examPattern: {
    totalQuestions: Number,
    totalMarks: Number,
    duration: String,
    sections: [String],
    negativeMarking: Boolean
  },
  syllabus: {
    subjects: [mongoose.Schema.Types.ObjectId],
    link: String,
    downloadUrl: String
  },
  importantBooks: [String],
  bestPrepTime: String,
  frequency: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exam', examSchema);
