const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Create connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'expense_tracker'}
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    
    console.log(`✅ Database '${process.env.DB_NAME || 'expense_tracker'}' created/verified`);

    // Use database
    await connection.query(`USE ${process.env.DB_NAME || 'expense_tracker'}`);

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        expense_income ENUM('Expense', 'Income') NOT NULL DEFAULT 'Expense',
        amount DECIMAL(10, 2) NOT NULL,
        category ENUM('Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Send Transfer', 'Salary', 'Bonus', 'Get Transfer', 'Other') NOT NULL,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_date (expense_date),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Expenses table created/verified');

    // Insert sample data if table is empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM expenses');
    
    if (rows[0].count === 0) {
      const sampleData = [
        ['Weekly Groceries', 'Expense', 156.43, 'Food', '2024-01-15'],
        ['Uber Ride to Airport', 'Expense', 24.50, 'Transport', '2024-01-14'],
        ['Netflix Subscription', 'Expense', 15.99, 'Entertainment', '2024-01-13'],
        ['Electric Bill', 'Expense', 89.00, 'Bills', '2024-01-12'],
        ['Nike Air Max', 'Expense', 120.00, 'Shopping', '2024-01-11'],
        ['Pharmacy - Vitamins', 'Expense', 45.67, 'Health', '2024-01-10'],
        ['Team Lunch', 'Expense', 68.50, 'Food', '2024-01-09'],
        ['Gas Station Shell', 'Expense', 55.00, 'Transport', '2024-01-08'],
        ['Spotify Subscription', 'Expense', 9.99, 'Entertainment', '2024-01-07'],
        ['Water Bill', 'Expense', 30.00, 'Bills', '2024-01-06'],
        ['Amazon Echo Dot', 'Expense', 49.99, 'Shopping', '2024-01-05'],
        ['February Salary', 'Income', 3500.00, 'Salary', '2024-01-31'],
      ];

      await connection.query(`
        INSERT INTO expenses (description, expense_income, amount, category, expense_date) 
        VALUES ?
      `, [sampleData]);

      console.log('✅ Sample data inserted');
    }

    await connection.end();
    console.log('🎉 Database initialization complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();