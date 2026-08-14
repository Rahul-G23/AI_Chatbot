// Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validateInput } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

router.get('/', (req, res) => {
	res.json({
		success: true,
		module: 'auth',
		endpoints: ['POST /register', 'POST /login', 'GET /profile', 'PUT /profile', 'PUT /settings']
	});
});

// Public routes
router.post('/register', authLimiter, validateUserRegistration, validateInput, authController.register);
router.post('/login', authLimiter, validateUserLogin, validateInput, authController.login);

// Protected routes
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, authController.updateUserProfile);
router.put('/settings', auth, authController.updateSettings);

module.exports = router;
