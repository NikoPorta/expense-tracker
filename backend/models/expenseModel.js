const { pool } = require('../config/database');

class ExpenseModel {
  // Get all expenses with optional filtering
  static async getAll(filters = {}) {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.startDate) {
      query += ' AND expense_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND expense_date <= ?';
      params.push(filters.endDate);
    }

    if (filters.search) {
      query += ' AND description LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY expense_date DESC, created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get expense by ID
  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Create new expense
  static async create(expenseData) {
    const { description, amount, category, expense_date } = expenseData;
    
    const [result] = await pool.execute(
      `INSERT INTO expenses (description, amount, category, expense_date) 
       VALUES (?, ?, ?, ?)`,
      [description, amount, category, expense_date]
    );

    return {
      id: result.insertId,
      ...expenseData,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Update expense
  static async update(id, expenseData) {
    const { description, amount, category, expense_date } = expenseData;
    
    const [result] = await pool.execute(
      `UPDATE expenses 
       SET description = ?, amount = ?, category = ?, expense_date = ?
       WHERE id = ?`,
      [description, amount, category, expense_date, id]
    );

    return result.affectedRows > 0;
  }

  // Delete expense
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM expenses WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get summary statistics
  static async getSummary() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_expenses,
        COALESCE(AVG(amount), 0) as average_expense,
        MIN(expense_date) as earliest_date,
        MAX(expense_date) as latest_date
      FROM expenses
    `);
    return rows[0];
  }

  // Get category breakdown
  static async getCategoryBreakdown() {
    const [rows] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `);
    return rows;
  }

  // Get monthly trends
  static async getMonthlyTrends() {
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(expense_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM expenses
      GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    return rows;
  }
}

module.exports = ExpenseModel;