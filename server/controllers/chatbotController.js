// Chatbot Controller
const ChatHistory = require('../models/ChatHistory');
const { generateAIResponse } = require('../services/aiService');
const Syllabus = require('../models/Syllabus');

// Send message to chatbot
exports.sendMessage = async (req, res) => {
  try {
    const { message, examName, sessionId } = req.body;
    const userId = req.userId;
    const resolvedExamName = examName || 'General';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Fetch relevant syllabus context
    const syllabusContext = examName ? await Syllabus.findOne({ examName }).limit(1) : null;
    const context = syllabusContext ? `${syllabusContext.subject} - ${syllabusContext.chapter}` : '';

    // Generate AI response
    const aiResponse = await generateAIResponse(message, resolvedExamName, context);

    // Save to chat history
    let chatSession;
    if (sessionId) {
      chatSession = await ChatHistory.findById(sessionId);
    } else {
      chatSession = new ChatHistory({
        userId,
        examName: resolvedExamName,
        sessionTitle: message.substring(0, 50)
      });
    }

    chatSession.messages.push({
      type: 'user',
      content: message,
      timestamp: new Date()
    });

    chatSession.messages.push({
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    });

    await chatSession.save();

    res.json({
      success: true,
      sessionId: chatSession._id,
      response: aiResponse,
      reply: aiResponse,
      message: 'Response generated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process message', error: error.message });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { examName, limit = 20, skip = 0 } = req.query;

    let query = { userId };
    if (examName) {
      query.examName = examName;
    }

    const chatSessions = await ChatHistory.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ChatHistory.countDocuments(query);

    res.json({
      success: true,
      chatSessions,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat history', error: error.message });
  }
};

// Get specific chat session
exports.getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const chatSession = await ChatHistory.findOne({ _id: sessionId, userId });

    if (!chatSession) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    res.json({
      success: true,
      chatSession
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat session', error: error.message });
  }
};

// Create new chat session
exports.createChatSession = async (req, res) => {
  try {
    const { examName } = req.body;
    const userId = req.userId;

    const chatSession = new ChatHistory({
      userId,
      examName,
      sessionTitle: `${examName} Chat - ${new Date().toLocaleDateString()}`
    });

    await chatSession.save();

    res.status(201).json({
      success: true,
      message: 'Chat session created',
      sessionId: chatSession._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create chat session', error: error.message });
  }
};

// Delete chat session
exports.deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    await ChatHistory.deleteOne({ _id: sessionId, userId });

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete chat session', error: error.message });
  }
};

module.exports = exports;
