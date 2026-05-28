const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examName: {
    type: String,
    enum: ['General', 'NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'KCET/KPSE', 'Banking', 'SSC', 'Railway', 'CAT', 'GATE', 'CUET', 'NDA', 'CLAT'],
    required: true
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionTitle: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
