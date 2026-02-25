const { validationResult } = require('express-validator');
const TransactionModel = require('../models/transactionModel');

// Validation rules
const transactionValidation = {
  create: [
    { 
      field: 'description', 
      rules: { notEmpty: true, isLength: { min: 2, max: 255 } } 
    },
    { 
      field: 'amount', 
      rules: { isFloat: { min: 0.01 }, notEmpty: true } 
    },
    { 
      field: 'category', 
      rules: { 
        notEmpty: true,
        isIn: { options: [['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other']] }
      } 
    },
    { 
      field: 'transaction_date', 
      rules: { notEmpty: true, isDate: true } 
    }
  ]
};

// Helper for validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all transactions
const getAllTransactions = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const transactions = await TransactionModel.getAll(filters);
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// Get single transaction
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await TransactionModel.getById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Create transaction
const createTransaction = async (req, res, next) => {
  try {
    const transaction = await TransactionModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Update transaction
const updateTransaction = async (req, res, next) => {
  try {
    // Check if transaction exists
    const existing = await TransactionModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updated = await TransactionModel.update(req.params.id, req.body);
    
    if (updated) {
      const transaction = await TransactionModel.getById(req.params.id);
      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction
      });
    }
  } catch (error) {
    next(error);
  }
};

// Delete transaction
const deleteTransaction = async (req, res, next) => {
  try {
    const deleted = await TransactionModel.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// Get summary statistics
const getSummary = async (req, res, next) => {
  try {
    const [summary, categories, monthly] = await Promise.all([
      ExpenseModel.getSummary(),
      ExpenseModel.getCategoryBreakdown(),
      ExpenseModel.getMonthlyTrends()
    ]);

    res.json({
      success: true,
      data: {
        summary,
        categories,
        monthlyTrends: monthly
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category breakdown
const getCategories = async (req, res, next) => {
  try {
    const categories = await TransactionModel.getCategoryBreakdown();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategories,
  validate,
  transactionValidation
};