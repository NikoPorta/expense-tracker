const { validationResult } = require('express-validator');
const UserModel = require('../models/userModel');

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

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await UserModel.getByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const user = await UserModel.create({
      name: (name || '').trim(),
      email: normalizedEmail,
      password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await UserModel.verifyCredentials({
      email: normalizedEmail,
      password
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate,
  register,
  login
};
