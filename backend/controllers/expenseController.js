const { validationResult } = require('express-validator');
const ExpenseModel = require('../models/expenseModel');

// Validation rules
const expenseValidation = {
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
      field: 'expense_date', 
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

// Get all expenses
const getAllExpenses = async (req, res, next) => {
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

    const expenses = await ExpenseModel.getAll(filters);
    
    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// Get single expense
const getExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseModel.getById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Create expense
const createExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Update expense
const updateExpense = async (req, res, next) => {
  try {
    // Check if expense exists
    const existing = await ExpenseModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const updated = await ExpenseModel.update(req.params.id, req.body);
    
    if (updated) {
      const expense = await ExpenseModel.getById(req.params.id);
      res.json({
        success: true,
        message: 'Expense updated successfully',
        data: expense
      });
    }
  } catch (error) {
    next(error);
  }
};

// Delete expense
const deleteExpense = async (req, res, next) => {
  try {
    const deleted = await ExpenseModel.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
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
    const categories = await ExpenseModel.getCategoryBreakdown();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getCategories,
  validate,
  expenseValidation
};