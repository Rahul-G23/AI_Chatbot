// User Profile Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
	res.json({
		success: true,
		module: 'user',
		endpoints: ['GET /profile', 'PUT /profile', 'PUT /settings']
	});
});

// Protected routes
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, authController.updateUserProfile);
router.put('/settings', auth, authController.updateSettings);

module.exports = router;
