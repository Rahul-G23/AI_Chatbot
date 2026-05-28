// Input validation middleware
const { body, validationResult } = require('express-validator');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Validation rules
const validateUserRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateUserLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateExamSelection = [
  body('targetExam')
    .isIn(['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'KCET/KPSE', 'Banking', 'SSC', 'Railway', 'CAT', 'GATE', 'CUET', 'NDA', 'CLAT'])
    .withMessage('Invalid exam selected')
];

module.exports = {
  validateInput,
  validateUserRegistration,
  validateUserLogin,
  validateExamSelection
};
