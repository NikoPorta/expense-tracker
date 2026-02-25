const { pool } = require('../config/database');
const crypto = require('crypto');

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, passwordHash) => {
  const [salt, storedHash] = String(passwordHash || '').split(':');
  if (!salt || !storedHash) return false;
  const inputHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(inputHash, 'hex'));
};

class UserModel {
  static async getByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  static async create({ name, email, password }) {
    const passwordHash = hashPassword(password);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name || null, email, passwordHash]
    );

    return {
      id: result.insertId,
      name: name || '',
      email
    };
  }

  static async verifyCredentials({ email, password }) {
    const user = await this.getByEmail(email);
    if (!user) return null;

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      name: user.name || '',
      email: user.email
    };
  }
}

module.exports = UserModel;
