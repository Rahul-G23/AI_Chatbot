// Chatbot Routes
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Protected routes
router.post('/message', auth, aiLimiter, chatbotController.sendMessage);
router.get('/history', auth, chatbotController.getChatHistory);
router.get('/session/:sessionId', auth, chatbotController.getChatSession);
router.post('/session', auth, chatbotController.createChatSession);
router.delete('/session/:sessionId', auth, chatbotController.deleteChatSession);

module.exports = router;
