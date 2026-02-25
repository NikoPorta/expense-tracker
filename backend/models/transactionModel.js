const { pool } = require('../config/database');

class TransactionModel {
  // Get all transactions with optional filtering
  static async getAll(filters = {}) {
    let query = 'SELECT * FROM transactions WHERE 1=1';
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

    query += ' ORDER BY transaction_date DESC, created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get expense by ID
  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Create new transaction
  static async create(transactionData) {
    const { description, expense_income, amount, category, transaction_date } = transactionData;
    
    const [result] = await pool.execute(
      `INSERT INTO transactions (description, expense_income, amount, category, transaction_date, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [description, expense_income, amount, category, transaction_date, transactionData.created_by || 'Anonymous']
    );

    return {
      id: result.insertId,
      ...transactionData,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Update expense
  static async update(id, transactionData) {
    const { description, amount, category, transaction_date } = transactionData;
    
    const [result] = await pool.execute(
      `UPDATE transactions 
       SET description = ?, amount = ?, category = ?, transaction_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [description, amount, category, transaction_date, id]
    );

    return result.affectedRows > 0;
  }

  // Delete expense
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM transactions WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get summary statistics
  static async getSummary() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_transactions,
        COALESCE(AVG(amount), 0) as average_transaction,
        MIN(transaction_date) as earliest_date,
        MAX(transaction_date) as latest_date
      FROM transactions
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
      FROM transactions
      GROUP BY category
      ORDER BY total DESC
    `);
    return rows;
  }

  // Get monthly trends
  static async getMonthlyTrends() {
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    return rows;
  }
}

module.exports = TransactionModel;