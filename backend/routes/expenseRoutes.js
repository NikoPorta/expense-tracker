const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getCategories,
  validate
} = require('../controllers/expenseController');

// Validation middleware
const createValidation = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 2, max: 255 }).withMessage('Description must be 2-255 characters'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Send Transfer', 'Salary', 'Bonus', 'Get Transfer', 'Other'])
    .withMessage('Invalid category'),
  body('expense_date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  validate
];

const updateValidation = [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Description must be 2-255 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
  body('category')
    .optional()
    .isIn(['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other', 'Bonus'])
    .withMessage('Invalid category'),
  body('expense_date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  validate
];

// Routes
router.get('/summary', getSummary);
router.get('/categories', getCategories);
router.get('/', getAllExpenses);
router.get('/:id', getExpense);
router.post('/', createValidation, createExpense);
router.put('/:id', updateValidation, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;