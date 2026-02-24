// services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

class ExpenseAPI {
  // Generic request handler
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all expenses with optional filters
  static async getExpenses(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/expenses${query}`);
  }

  // Get single expense
  static async getExpense(id) {
    return this.request(`/expenses/${id}`);
  }

  // Create expense
  static async createExpense(expenseData) {
    return this.request('/expenses', {
      method: 'POST',
      body: expenseData
    });
  }

  // Update expense
  static async updateExpense(id, expenseData) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: expenseData
    });
  }

  // Delete expense
  static async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE'
    });
  }

  // Get summary statistics
  static async getSummary() {
    return this.request('/expenses/summary');
  }

  // Get category breakdown
  static async getCategories() {
    return this.request('/expenses/categories');
  }
}

export default ExpenseAPI;