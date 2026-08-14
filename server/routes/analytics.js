// User Analytics Routes
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
	res.json({
		success: true,
		module: 'analytics',
		endpoints: ['GET /dashboard', 'GET /performance', 'GET /weak-topics', 'POST /study-time', 'GET /leaderboard']
	});
});

// Protected routes
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);
router.get('/performance', auth, analyticsController.getPerformanceBySubject);
router.get('/weak-topics', auth, analyticsController.getWeakTopics);
router.post('/study-time', auth, analyticsController.addStudyTime);
router.get('/leaderboard', analyticsController.getLeaderboard);

module.exports = router;
