const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examName: {
    type: String,
    required: true,
    enum: ['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'KCET/KPSE', 'Banking', 'SSC', 'Railway', 'CAT', 'GATE', 'CUET', 'NDA', 'CLAT']
  },
  targetDate: Date,
  remainingDays: Number,
  dailyStudyHours: Number,
  weakSubjects: [String],
  
  schedule: [{
    day: Number,
    date: Date,
    subject: String,
    topics: [String],
    revisionTopic: String,
    priority: String
  }],
  
  milestones: [{
    name: String,
    targetDate: Date,
    completed: { type: Boolean, default: false },
    completedDate: Date
  }],
  
  // mockTestSchedule removed
  
  isAIGenerated: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
