// Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validateInput } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validateUserRegistration, validateInput, authController.register);
router.post('/login', authLimiter, validateUserLogin, validateInput, authController.login);

// Protected routes
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, authController.updateUserProfile);
router.put('/settings', auth, authController.updateSettings);

module.exports = router;
