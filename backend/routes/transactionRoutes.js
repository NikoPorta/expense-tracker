const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategories,
  validate
} = require('../controllers/transactionController');

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
  body('wallet')
    .notEmpty().withMessage('Wallet is required')
    .isLength({ min: 2, max: 100 }).withMessage('Wallet must be 2-100 characters'),
  body('transaction_date')
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
  body('wallet')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Wallet must be 2-100 characters'),
  body('transaction_date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  validate
];

// Routes
router.get('/summary', getSummary);
router.get('/categories', getCategories);
router.get('/', getAllTransactions);
router.get('/:id', getTransaction);
router.post('/', createValidation, createTransaction);
router.put('/:id', updateValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
