const express = require('express');
const { body } = require('express-validator');
const { register, login, validate } = require('../controllers/authController');

const router = express.Router();

const registerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;
