// services/api.js
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const API_BASE_URL = 'http://localhost:3000/api';
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || import.meta.env.ENVIRONMENT || 'development';
const IS_PRODUCTION = ENVIRONMENT === 'production';
const EXPENSES_COLLECTION = 'expenses';

class ExpenseAPI {
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

  static async getExpenses(filters = {}) {
    if (!IS_PRODUCTION) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return this.request(`/expenses${query}`);
    }

    const snapshot = await getDocs(collection(db, EXPENSES_COLLECTION));
    let data = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));

    if (filters && Object.keys(filters).length > 0) {
      data = data.filter((item) => Object.entries(filters).every(([key, value]) => !value || item[key] === value));
    }

    return { data };
  }

  static async getExpense(id) {
    if (!IS_PRODUCTION) {
      return this.request(`/expenses/${id}`);
    }

    const docRef = doc(db, EXPENSES_COLLECTION, String(id));
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('Expense not found');
    }

    return { data: { id: snapshot.id, ...snapshot.data() } };
  }

  static async createExpense(expenseData) {
    if (!IS_PRODUCTION) {
      return this.request('/expenses', {
        method: 'POST',
        body: expenseData
      });
    }

    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expenseData);
    return { data: { id: docRef.id, ...expenseData } };
  }

  static async updateExpense(id, expenseData) {
    if (!IS_PRODUCTION) {
      return this.request(`/expenses/${id}`, {
        method: 'PUT',
        body: expenseData
      });
    }

    const docRef = doc(db, EXPENSES_COLLECTION, String(id));
    await updateDoc(docRef, expenseData);
    return { data: { id, ...expenseData } };
  }

  static async deleteExpense(id) {
    if (!IS_PRODUCTION) {
      return this.request(`/expenses/${id}`, {
        method: 'DELETE'
      });
    }

    const docRef = doc(db, EXPENSES_COLLECTION, String(id));
    await deleteDoc(docRef);
    return { data: { id } };
  }

  static async getSummary() {
    if (!IS_PRODUCTION) {
      return this.request('/expenses/summary');
    }

    const { data } = await this.getExpenses();
    const summary = data.reduce(
      (acc, item) => {
        const amount = Number(item.amount || 0);
        if (item.expense_income === 'Income') acc.totalIncome += amount;
        if (item.expense_income === 'Expense') acc.totalExpenses += amount;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    return { data: { ...summary, balance: summary.totalIncome - summary.totalExpenses } };
  }

  static async getCategories() {
    if (!IS_PRODUCTION) {
      return this.request('/expenses/categories');
    }

    const { data } = await this.getExpenses();
    const categories = data.reduce((acc, item) => {
      const amount = Number(item.amount || 0);
      acc[item.category] = (acc[item.category] || 0) + amount;
      return acc;
    }, {});

    return { data: categories };
  }
}

export default ExpenseAPI;
