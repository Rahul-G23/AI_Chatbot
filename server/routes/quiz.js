// Quiz Routes
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', quizController.getAllQuizzes);

// Protected routes
router.post('/submit', auth, quizController.submitQuiz);
router.get('/results', auth, quizController.getUserQuizResults);
router.post('/generate', auth, quizController.generateAIQuiz);
router.get('/:quizId', quizController.getQuizDetails);

module.exports = router;
