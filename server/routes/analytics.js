// User Analytics Routes
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Protected routes
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);
router.get('/performance', auth, analyticsController.getPerformanceBySubject);
router.get('/weak-topics', auth, analyticsController.getWeakTopics);
router.get('/leaderboard', analyticsController.getLeaderboard);

module.exports = router;
