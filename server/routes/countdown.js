// Countdown Routes
const express = require('express');
const router = express.Router();
const countdownController = require('../controllers/countdownController');

// Public routes
router.get('/', countdownController.getCountdownDates);
router.get('/:examName', countdownController.getExamWithCountdown);

module.exports = router;
