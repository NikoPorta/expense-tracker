<template>
  <div v-if="isAuthLoading" class="auth-loading-screen">
    <div class="auth-loading-card">
      <div class="spinner-border text-light mb-3" role="status"></div>
      <p class="mb-0">Loading authentication...</p>
    </div>
  </div>

  <div v-else-if="!currentUser" class="auth-page">
    <div class="auth-bg">
      <div class="auth-orb auth-orb-1"></div>
      <div class="auth-orb auth-orb-2"></div>
    </div>

    <div class="auth-card">
      <h2 class="fw-bold mb-2">{{ authMode === 'login' ? 'Welcome back' : 'Create account' }}</h2>
      <p class="text-muted mb-4">
        {{ authMode === 'login' ? 'Sign in to manage your expenses.' : 'Register and start tracking your finances.' }}
      </p>

      <div class="d-flex auth-switch mb-4">
        <button class="btn flex-fill" :class="authMode === 'login' ? 'btn-primary' : 'btn-outline-primary'" @click="authMode = 'login'">
          Login
        </button>
        <button class="btn flex-fill" :class="authMode === 'register' ? 'btn-primary' : 'btn-outline-primary'" @click="authMode = 'register'">
          Register
        </button>
      </div>

      <form @submit.prevent="handleAuthSubmit">
        <div class="mb-3" v-if="authMode === 'register'">
          <label class="form-label">Name</label>
          <input v-model.trim="authForm.name" type="text" class="form-control" placeholder="Your name" />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model.trim="authForm.email" type="email" class="form-control" placeholder="you@example.com" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="authForm.password" type="password" class="form-control" placeholder="Minimum 6 characters" required />
        </div>

        <div class="mb-3" v-if="authMode === 'register'">
          <label class="form-label">Confirm password</label>
          <input v-model="authForm.confirmPassword" type="password" class="form-control" placeholder="Repeat password" required />
        </div>

        <div v-if="authError" class="alert alert-danger py-2">{{ authError }}</div>

        <button type="submit" class="btn btn-primary w-100" :disabled="isAuthSubmitting">
          <span v-if="!isAuthSubmitting">{{ authMode === 'login' ? 'Login' : 'Register' }}</span>
          <span v-else class="spinner-border spinner-border-sm"></span>
        </button>
      </form>

      <small class="d-block mt-3 text-muted">
        Auth mode: <strong>{{ isProduction ? 'Firebase (production)' : 'Local storage (development)' }}</strong>
      </small>
    </div>
  </div>

  <div v-else class="app-container">
    <!-- Animated Background with Harmony Gradients -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="container-fluid py-4 position-relative">
      <div class="container">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card glass-card header-card" :class="{ 'animate-in': mounted }">
              <div class="card-body text-center py-5 position-relative overflow-hidden">
                <div class="auth-user-actions">
                  <span class="badge text-bg-light">{{ currentUser.name || currentUser.email }}</span>
                  <button class="btn btn-sm btn-light ms-2" @click="handleLogout">Logout</button>
                </div>
                <div class="shimmer-effect"></div>
                <h1 class="display-4 fw-bold mb-3">
                  <i class="bi bi-wallet2 me-3 bounce-icon"></i>
                  <span class="typewriter-text">{{ headerText }}</span>
                  <span class="cursor-blink">|</span>
                </h1>
                <p class="lead mb-0 harmony-text-light fade-in-up" :class="{ 'show': mounted }">
                  Manage your daily finances with harmony
                </p>
                <div class="floating-icons">
                  <i class="bi bi-coin floating-icon harmony-text-accent1" style="--delay: 0s"></i>
                  <i class="bi bi-cash-coin floating-icon harmony-text-accent2" style="--delay: 0.5s"></i>
                  <i class="bi bi-piggy-bank floating-icon harmony-text-accent3" style="--delay: 1s"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards with Harmony Colors -->
        <div class="row g-4 mb-4">
          <div v-for="(card, index) in summaryCards" :key="card.type" class="col-md-4">
            <div class="card summary-card h-100 harmony-shadow"
              :class="[`harmony-border-${card.harmonyColor}`, { 'slide-up': mounted }]"
              :style="{ animationDelay: `${index * 0.15 + 0.5}s` }">
              <div class="card-body text-center position-relative overflow-hidden">
                <div class="card-shine"></div>
                <div class="icon-wrapper mb-3" :class="`harmony-bg-${card.harmonyColor}`">
                  <i :class="`bi ${card.icon} fs-2`"></i>
                </div>
                <h5 class="card-title harmony-text-muted mb-2">{{ card.title }}</h5>
                <h2 class="fw-bold counter-text" :class="`harmony-text-${card.harmonyColor}`">
                  <div v-if="card.title === 'Transactions'">
                    <span class="counter-transactions" :data-target="card.value">$0.00</span>
                  </div>
                  <div v-else>
                    <span class="counter" :data-target="card.value">$0.00</span>
                  </div>
                </h2>
                <div class="trend-indicator" v-if="card.trend" :class="`harmony-text-${card.trendColor}`">
                  <i :class="`bi ${card.trendIcon} me-1`"></i>
                  <small>{{ card.trend }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Add Transaction Form (Expense/Income Toggle) -->
          <div class="col-lg-4">
            <div class="card form-card sticky-top harmony-shadow" :class="{ 'slide-in-left': mounted }"
              style="top: 20px; animation-delay: 0.8s;">
              <div class="card-header border-0 pt-4 px-4 bg-transparent">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="mb-0 fw-bold harmony-text-gradient">
                    <i class="bi me-2 pulse-icon"
                      :class="transactionType === 'expense' ? 'bi-dash-circle-fill harmony-text-expense' : 'bi-plus-circle-fill harmony-text-accent1'"></i>
                    {{ transactionType === 'expense' ? 'Add Expense' : 'Add Income' }}
                  </h4>
                </div>

                <!-- Toggle Switch -->
                <div class="transaction-toggle-wrapper">
                  <div class="transaction-toggle" :class="{ 'income-active': transactionType === 'income' }"
                    @click="toggleTransactionType">
                    <div class="toggle-slider">
                      <div class="toggle-option expense-option" :class="{ active: transactionType === 'expense' }">
                        <i class="bi bi-arrow-down-circle"></i>
                        <span>Expense</span>
                      </div>
                      <div class="toggle-option income-option" :class="{ active: transactionType === 'income' }">
                        <i class="bi bi-arrow-up-circle"></i>
                        <span>Income</span>
                      </div>
                      <div class="toggle-indicator"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-body p-4">
                <form @submit.prevent="addTransaction" class="needs-validation" novalidate>
                  <!-- Transaction Type Indicator -->
                  <div class="transaction-type-badge mb-3"
                    :class="transactionType === 'expense' ? 'expense-badge' : 'income-badge'">
                    <i class="bi"
                      :class="transactionType === 'expense' ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'"></i>
                    <span>You're adding an {{ transactionType }}</span>
                  </div>

                  <div class="form-floating mb-3 input-group-animated">
                    <input v-model="newTransaction.description" type="text" class="form-control harmony-input"
                      :class="{ 'income-input': transactionType === 'income' }" id="descInput" placeholder="Description"
                      required @focus="activeField = 'desc'" @blur="activeField = null">
                    <label for="descInput" class="harmony-label">
                      <i class="bi bi-pencil me-2"
                        :class="transactionType === 'expense' ? 'harmony-text-primary' : 'harmony-text-accent1'"></i>
                      Description
                    </label>
                    <div class="input-line harmony-line" :class="{
                      'active': activeField === 'desc',
                      'income-line': transactionType === 'income'
                    }"></div>
                  </div>

                  <div class="form-floating mb-3 input-group-animated">
                    <div class="amount-input-wrapper">
                      <span class="currency-symbol"
                        :class="transactionType === 'expense' ? 'expense-symbol' : 'income-symbol'">
                        {{ transactionType === 'expense' ? '-' : '+' }}
                      </span>
                      <input v-model.number="newTransaction.amount" type="number" step="0.01" min="0"
                        class="form-control harmony-input amount-input" :class="{
                          'income-input': transactionType === 'income',
                          'is-invalid': validationErrors?.amount
                        }" id="amountInput" placeholder="0.00" required @focus="activeField = 'amount'"
                        @blur="activeField = null" :aria-label="'Enter ' + transactionType + ' amount'">
                    </div>
                    <div class="input-line harmony-line" :class="{
                      'active': activeField === 'amount',
                      'income-line': transactionType === 'income'
                    }"></div>
                  </div>

                  <div class="form-floating mb-3 input-group-animated">
                    <select v-model="newTransaction.category" class="form-select harmony-input"
                      :class="{ 'income-input': transactionType === 'income' }" id="categoryInput" required
                      @focus="activeField = 'category'" @blur="activeField = null">
                      <option value="" disabled selected>Select category</option>

                      <!-- Expense Categories -->
                      <optgroup v-if="transactionType === 'expense'" label="Expense Categories">
                        <option value="Food">🍔 Food & Dining</option>
                        <option value="Transport">🚗 Transport</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Entertainment">🎬 Entertainment</option>
                        <option value="Bills">💡 Bills & Utilities</option>
                        <option value="Health">🏥 Health</option>
                        <option value="Send Transfer">📈 Send Transfer</option>
                        <option value="Other">📦 Other</option>
                      </optgroup>

                      <!-- Income Categories -->
                      <optgroup v-else label="Income Categories">
                        <option value="Salary">💼 Salary</option>
                        <option value="Get Transfer">📈 Get Transfer</option>
                        <option value="Bonus">🎁 Bonus</option>
                      </optgroup>
                    </select>
                    <label for="categoryInput" class="harmony-label">
                      <i class="bi bi-tag me-2"
                        :class="transactionType === 'expense' ? 'harmony-text-primary' : 'harmony-text-accent1'"></i>
                      Category
                    </label>
                    <div class="input-line harmony-line" :class="{
                      'active': activeField === 'category',
                      'income-line': transactionType === 'income'
                    }"></div>
                  </div>

                  <div class="form-floating mb-4 input-group-animated">
                    <input v-model="newTransaction.expense_date" type="date" class="form-control harmony-input"
                      :class="{ 'income-input': transactionType === 'income' }" id="dateInput" required
                      @focus="activeField = 'date'" @blur="activeField = null">
                    <label for="dateInput" class="harmony-label">
                      <i class="bi bi-calendar me-2"
                        :class="transactionType === 'expense' ? 'harmony-text-primary' : 'harmony-text-accent1'"></i>
                      Date
                    </label>
                    <div class="input-line harmony-line" :class="{
                      'active': activeField === 'date',
                      'income-line': transactionType === 'income'
                    }"></div>
                  </div>

                  <button type="submit" class="btn w-100 btn-lg submit-btn" :class="[
                    transactionType === 'expense' ? 'harmony-btn-expense' : 'harmony-btn-income',
                    { 'loading': isSubmitting }
                  ]">
                    <span class="btn-content">
                      <i class="bi me-2" :class="transactionType === 'expense' ? 'bi-plus-lg' : 'bi-plus-lg'"></i>
                      <span v-if="!isSubmitting">
                        Add {{ transactionType === 'expense' ? 'Expense' : 'Income' }}
                      </span>
                      <span v-else class="spinner-border spinner-border-sm"></span>
                    </span>
                    <div class="btn-ripple"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Charts & List -->
          <div class="col-lg-8">
            <!-- Category Breakdown -->
            <div class="card chart-card mb-4 harmony-shadow" :class="{ 'fade-in-scale': mounted }"
              style="animation-delay: 1s;">
              <div class="card-header border-0 pt-4 px-4 bg-transparent">
                <h4 class="mb-0 fw-bold harmony-text-gradient">
                  <i class="bi bi-pie-chart-fill me-2 harmony-text-secondary"></i>Spending Analytics
                </h4>
              </div>
              <div class="card-body p-4">
                <div class="row g-4">
                  <div v-for="(amount, category, index) in categoryTotals" :key="category" class="col-md-6">
                    <div class="category-item" :class="{ 'slide-in-right': mounted }"
                      :style="{ animationDelay: `${index * 0.1 + 1.2}s` }">
                      <div class="d-flex align-items-center mb-2">
                        <div class="category-icon harmony-icon-shadow"
                          :class="`harmony-bg-${getHarmonyColor(category)}`">
                          <i :class="`bi ${getCategoryIcon(category)}`"></i>
                        </div>
                        <div class="flex-grow-1 ms-3">
                          <div class="d-flex justify-content-between mb-1">
                            <span class="fw-semibold harmony-text-dark">{{ category }}</span>
                            <span class="fw-bold harmony-text-primary">{{ formatCurrency(amount) }}</span>
                          </div>
                          <div class="progress progress-animated" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated harmony-progress"
                              :class="`harmony-bg-${getHarmonyColor(category)}`" :style="{ width: '0%' }"
                              :data-width="(amount / totalExpenses * 100) + '%'"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Transactions -->
            <div class="card transactions-card harmony-shadow" :class="{ 'fade-in-up': mounted }"
              style="animation-delay: 1.4s;">
              <div
                class="card-header border-0 pt-4 px-4 bg-transparent d-flex justify-content-between align-items-center">
                <h4 class="mb-0 fw-bold harmony-text-gradient">
                  <i class="bi bi-receipt me-2 harmony-text-tertiary"></i>Recent Transactions
                </h4>
                <div class="d-flex gap-2">
                  <button @click="filter = 'all'" class="btn btn-sm"
                    :class="filter === 'all' ? 'harmony-btn-primary' : 'harmony-btn-outline'">
                    All
                  </button>
                  <button @click="exportData" class="btn harmony-btn-outline btn-sm" title="Export to JSON">
                    <i class="bi bi-download harmony-text-secondary"></i>
                  </button>
                  <button @click="confirmClear" class="btn harmony-btn-danger-outline btn-sm">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0 harmony-table">
                    <thead class="harmony-table-header">
                      <tr>
                        <th class="ps-4 harmony-text-muted">Date</th>
                        <th class="harmony-text-muted">Description</th>
                        <th class="harmony-text-muted">Category</th>
                        <th class="harmony-text-muted">Amount</th>
                        <th class="text-center harmony-text-muted">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <transition-group name="list">
                        <tr v-for="(expense, index) in filteredExpenses" :key="expense.id"
                          class="align-middle transaction-row" :style="{ animationDelay: `${index * 0.05}s` }">
                          <td class="ps-4">
                            <div class="d-flex align-items-center">
                              <div class="date-badge harmony-gradient-primary me-2">
                                <span class="day">{{ formatDay(expense.expense_date) }}</span>
                                <span class="month">{{ formatMonth(expense.expense_date) }}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div class="fw-semibold harmony-text-dark">{{ expense.description }}</div>
                            <small class="harmony-text-muted">{{ formatTime(expense.expense_date) }}</small>
                          </td>
                          <td>
                            <span class="badge category-badge harmony-badge"
                              :class="`harmony-bg-${getHarmonyColor(expense.category)}`">
                              <i :class="`bi ${getCategoryIcon(expense.category)} me-1`"></i>
                              {{ expense.category }}
                            </span>
                          </td>
                          <td class="fw-bold"
                            :class="expense.expense_income === 'Income' ? 'harmony-text-accent1' : 'harmony-text-expense'">
                            <span v-if="expense.expense_income === 'Income'" class="amount-value income-amount">
                              +{{ formatCurrency(expense.amount) }}
                            </span>
                            <span v-else class="amount-value">
                              -{{ formatCurrency(expense.amount) }}
                            </span>
                          </td>
                          <td class="text-center">
                            <button @click="deleteExpense(expense.id)" class="btn btn-delete harmony-btn-delete btn-sm"
                              title="Delete">
                              <i class="bi bi-x-lg"></i>
                            </button>
                          </td>
                        </tr>
                      </transition-group>
                      <tr v-if="filteredExpenses.length === 0">
                        <td colspan="5" class="text-center py-5 empty-state">
                          <div class="empty-animation">
                            <i class="bi bi-inbox fs-1 mb-3 d-block harmony-text-muted"></i>
                            <p class="harmony-text-muted mb-0">No expenses found</p>
                            <small class="harmony-text-light">Add your first transaction above!</small>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id"
          class="toast show align-items-center text-white border-0 mb-2 harmony-toast"
          :class="`harmony-bg-${toast.harmonyType}`" role="alert">
          <div class="d-flex">
            <div class="toast-body">
              <i :class="`bi ${toast.icon} me-2`"></i>
              {{ toast.message }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="removeToast(toast.id)"></button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Confetti Canvas -->
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from './services/api'
import AuthService from './services/auth'

const mounted = ref(false)
const isSubmitting = ref(false)
const activeField = ref(null)
const transactionType = ref('expense') // 'expense' or 'income'
const headerText = ref('')
const fullHeaderText = 'Daily Expense Tracker'
const toasts = ref([])
const confettiCanvas = ref(null)
const filter = ref('all')
const validationErrors = ref({})
const isProduction = AuthService.isProduction()
const isAuthLoading = ref(true)
const isAuthSubmitting = ref(false)
const currentUser = ref(null)
const authMode = ref('login')
const authError = ref('')
const authForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})
let unsubscribeAuth = null

// Harmony Color Palette
// Primary: Teal (#0D9488) - Main brand color
// Secondary: Cyan (#06B6D4) - Complementary adjacent
// Tertiary: Blue (#3B82F6) - Complementary adjacent
// Accent1: Emerald (#10B981) - Success/Positive
// Accent2: Violet (#8B5CF6) - Special highlights
// Accent3: Rose (#F43F5E) - Expense/Negative

const harmonyColors = {
  'Food': 'primary',
  'Transport': 'secondary',
  'Shopping': 'tertiary',
  'Entertainment': 'accent2',
  'Bills': 'neutral',
  'Health': 'accent1',
  'Other': 'muted',
  'Salary': 'accent2',
  'Bonus': 'accent2',
  'Send Transfer': 'accent3',
  'Get Transfer': 'accent1'
}

const sampleExpenses = [
  { id: 1, description: 'Weekly Groceries', amount: 156.43, category: 'Food', date: '2024-01-15', timestamp: Date.now() - 86400000 },
  { id: 2, description: 'Uber Ride to Airport', amount: 24.50, category: 'Transport', date: '2024-01-14', timestamp: Date.now() - 172800000 },
  { id: 3, description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2024-01-13', timestamp: Date.now() - 259200000 },
  { id: 4, description: 'Electric Bill', amount: 89.00, category: 'Bills', date: '2024-01-12', timestamp: Date.now() - 345600000 },
  { id: 5, description: 'Nike Air Max', amount: 120.00, category: 'Shopping', date: '2024-01-11', timestamp: Date.now() - 432000000 },
  { id: 6, description: 'Pharmacy - Vitamins', amount: 45.67, category: 'Health', date: '2024-01-10', timestamp: Date.now() - 518400000 },
  { id: 7, description: 'Team Lunch', amount: 68.50, category: 'Food', date: '2024-01-09', timestamp: Date.now() - 604800000 },
  { id: 8, description: 'Gas Station Shell', amount: 55.00, category: 'Transport', date: '2024-01-08', timestamp: Date.now() - 691200000 }
]

const expenses = ref([])
const newExpense = ref({
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0]
})

const newTransaction = ref({
  description: '',
  amount: '',
  category: '',
  expense_date: new Date().toISOString().split('T')[0],
  expense_income: 'expense'
})

// Toggle between expense and income
const toggleTransactionType = () => {
  transactionType.value = transactionType.value === 'expense' ? 'income' : 'expense'
  newTransaction.value.expense_income = transactionType.value
  newTransaction.value.category = '' // Reset category when switching
}

const resetTrackerState = () => {
  mounted.value = false
  headerText.value = ''
  expenses.value = []
  toasts.value = []
}

const initializeTracker = async () => {
  try {
    const fetchExpenses = await api.getExpenses()
    expenses.value = fetchExpenses.data || []
  } catch (error) {
    if (error?.code === 'permission-denied' || String(error?.message || '').includes('Missing or insufficient permissions')) {
      showToast('Firebase permission denied. Update Firestore rules for expenses collection.', 'danger', 'bi-shield-exclamation')
    }
    console.error('Failed to fetch expenses:', error)
  }

  setTimeout(() => {
    mounted.value = true
    if (!headerText.value) typeWriter()
    animateCounters()
    animateProgressBars()
  }, 100)
}

const mapAuthError = (error) => {
  const message = String(error?.message || 'Authentication failed')
  if (message.includes('auth/email-already-in-use')) return 'Email already exists.'
  if (message.includes('auth/invalid-credential')) return 'Invalid email or password.'
  if (message.includes('auth/invalid-email')) return 'Invalid email format.'
  if (message.includes('auth/weak-password')) return 'Password should be at least 6 characters.'
  return message
}

const handleAuthSubmit = async () => {
  authError.value = ''

  if (!authForm.value.email || !authForm.value.password) {
    authError.value = 'Email and password are required.'
    return
  }

  if (authMode.value === 'register') {
    if (authForm.value.password.length < 6) {
      authError.value = 'Password should be at least 6 characters.'
      return
    }
    if (authForm.value.password !== authForm.value.confirmPassword) {
      authError.value = 'Passwords do not match.'
      return
    }
  }

  isAuthSubmitting.value = true

  try {
    if (authMode.value === 'login') {
      const user = await AuthService.login({
        email: authForm.value.email,
        password: authForm.value.password
      })
      if (!isProduction) {
        currentUser.value = user
        await initializeTracker()
      }
    } else {
      const user = await AuthService.register({
        name: authForm.value.name,
        email: authForm.value.email,
        password: authForm.value.password
      })
      if (!isProduction) {
        currentUser.value = user
        await initializeTracker()
      }
    }

    authForm.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  } catch (error) {
    authError.value = mapAuthError(error)
  } finally {
    isAuthSubmitting.value = false
  }
}

const handleLogout = async () => {
  await AuthService.logout()
  if (!isProduction) {
    currentUser.value = null
    resetTrackerState()
  }
}

onMounted(() => {
  unsubscribeAuth = AuthService.onAuthStateChange(async (user) => {
    currentUser.value = user
    if (user) {
      await initializeTracker()
    } else {
      resetTrackerState()
    }
    isAuthLoading.value = false
  })
})

onUnmounted(() => {
  if (typeof unsubscribeAuth === 'function') {
    unsubscribeAuth()
  }
})

const typeWriter = () => {
  let i = 0
  const interval = setInterval(() => {
    if (i < fullHeaderText.length) {
      headerText.value += fullHeaderText.charAt(i)
      i++
    } else {
      clearInterval(interval)
    }
  }, 100)
}

const animateCounters = () => {
  nextTick(() => {
    document.querySelectorAll('.counter').forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target')) || 0
      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const formatNumber = (num) => {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt'
        } else if (num >= 1000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        }
        return num.toFixed(0)
      }

      const updateCounter = () => {
        current += increment
        if (current < target) {
          counter.textContent = 'Rp ' + formatNumber(current)
          requestAnimationFrame(updateCounter)
        } else {
          counter.textContent = 'Rp ' + formatNumber(target)
        }
      }

      updateCounter()
    })
    document.querySelectorAll('.counter-transactions').forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target')) || 0
      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const updateCounter = () => {
        current += increment
        if (current < target) {
          counter.textContent = current.toFixed(0)
          requestAnimationFrame(updateCounter)
        } else {
          counter.textContent = target.toFixed(0)
        }
      }
      updateCounter()
    })
  })
}

const animateProgressBars = () => {
  nextTick(() => {
    setTimeout(() => {
      document.querySelectorAll('.progress-bar').forEach(bar => {
        const width = bar.getAttribute('data-width')
        if (width) bar.style.width = width
      })
    }, 500)
  })
}

const sortedExpenses = computed(() => {
  return [...expenses.value].sort(
    (a, b) => new Date(b.expense_date || b.date) - new Date(a.expense_date || a.date)
  )
})

const filteredExpenses = computed(() => {
  if (filter.value === 'all') return sortedExpenses.value
  return sortedExpenses.value.filter(e => e.category === filter.value)
})

const totalIncome = computed(() => {
  return expenses.value
    .filter(e => ['Income'].includes(e.expense_income))
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
})

const totalExpenses = computed(() => {
  return expenses.value
    .filter(e => ['Expense'].includes(e.expense_income))
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
})

const totalBalance = computed(() => totalIncome.value - totalExpenses.value)
const trendBalance = computed(() => {
  const lastMonthExpenses = expenses.value
    .filter(e => {
      const date = new Date(e.expense_date || e.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() - 1 && ['Expense'].includes(e.expense_income)
    })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const lastMonthIncome = expenses.value
    .filter(e => {
      const date = new Date(e.expense_date || e.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() - 1 && ['Income'].includes(e.expense_income)
    })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const lastMonthBalance = lastMonthIncome - lastMonthExpenses

  if (lastMonthBalance - totalBalance.value === 0) return '0'
  if (lastMonthBalance === 0 && totalBalance.value > 0) return '+100' // If last month balance is 0, we consider it a 100% increase if current balance is positive

  const change = ((totalBalance.value - lastMonthBalance) / lastMonthBalance) * 100
  return change >= 0 ? `+${change.toFixed(1)}` : `${change.toFixed(1)}`
})
const trendExpenses = computed(() => {
  const currentWeekExpenses = expenses.value
    .filter(e => {
      const date = new Date(e.expense_date || e.date)
      const now = new Date()
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7))
      return date >= oneWeekAgo && ['Expense'].includes(e.expense_income)
    })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const now = new Date()
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)

  const twoWeekAgo = new Date(now)
  twoWeekAgo.setDate(now.getDate() - 14)

  const lastWeekExpenses = expenses.value.filter(e => {
    const date = new Date(e.expense_date)
    return (
      date >= twoWeekAgo &&
      date < oneWeekAgo &&
      e.expense_income === 'Expense'
    )
  })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  if (currentWeekExpenses - lastWeekExpenses === 0) return '0'
  if (lastWeekExpenses === 0 && currentWeekExpenses > 0) return '+100' // If last week expenses is 0, we consider it a 100% increase if current expenses is positive)

  const change = ((currentWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100
  return change >= 0 ? `+${change.toFixed(1)}` : `${change.toFixed(1)}`
})

const categoryTotals = computed(() => {
  const totals = {}
  expenses.value.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + parseFloat(e.amount);
  })
  return totals
})

const summaryCards = computed(() => [
  {
    type: 'balance',
    title: 'Total Balance',
    value: totalBalance.value,
    harmonyColor: 'accent1',
    icon: 'bi-wallet',
    trend: trendBalance.value + '% vs last month',
    trendIcon: trendBalance.value >= 0 ? 'bi-arrow-up' : 'bi-arrow-down',
    trendColor: 'accent1'
  },
  {
    type: 'expenses',
    title: 'Total Expenses',
    value: totalExpenses.value,
    harmonyColor: 'expense',
    icon: 'bi-graph-down-arrow',
    trend: trendExpenses.value + '% vs last week',
    trendIcon: trendExpenses.value >= 0 ? 'bi-arrow-up' : 'bi-arrow-down',
    trendColor: 'expense'
  },
  {
    type: 'transactions',
    title: 'Transactions',
    value: expenses.value.length,
    harmonyColor: 'secondary',
    icon: 'bi-receipt',
    trend: null,
    trendIcon: null,
    trendColor: null
  }
])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2
  }).format(amount)
}

// Add transaction
const addTransaction = async () => {
  isSubmitting.value = true

  await new Promise(resolve => setTimeout(resolve, 600))

  const transaction = {
    ...newTransaction.value,
    expense_income: transactionType.value === 'expense'
      ? "Expense"
      : "Income"
  }

  // Add to your expenses array (replace with API call)
  console.log('Adding transaction:', transaction)
  const created = await api.createExpense(transaction)
  showToast('Expense added successfully!', 'success', 'bi-check-circle')
  triggerConfetti()
  expenses.value.push(created?.data || transaction)

  // Reset form
  newTransaction.value = {
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    expense_income: transactionType.value
  }

  nextTick(() => {
    animateCounters()
    animateProgressBars()
  })

  isSubmitting.value = false
}

const deleteExpense = async (id) => {
  await api.deleteExpense(id)
  expenses.value = expenses.value.filter(e => e.id !== id)
  showToast('Expense deleted', 'danger', 'bi-trash')
  animateCounters()
}

const confirmClear = () => {
  if (confirm('Are you sure you want to clear all expenses?')) {
    expenses.value = []
    saveExpenses()
    showToast('All expenses cleared', 'warning', 'bi-exclamation-triangle')
  }
}

const exportData = () => {
  const dataStr = JSON.stringify(expenses.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'expenses.json'
  a.click()
  showToast('Data exported!', 'info', 'bi-download')
}

const saveExpenses = () => {
  localStorage.setItem('expenses', JSON.stringify(expenses.value))
}

const showToast = (message, type, icon) => {
  const harmonyTypeMap = {
    'success': 'accent1',
    'danger': 'expense',
    'warning': 'accent2',
    'info': 'secondary'
  }

  const id = Date.now()
  toasts.value.push({
    id,
    message,
    type,
    icon,
    harmonyType: harmonyTypeMap[type] || 'primary'
  })
  setTimeout(() => removeToast(id), 3000)
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const triggerConfetti = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []
  // Harmony color palette for confetti
  const colors = ['#0D9488', '#06B6D4', '#3B82F6', '#10B981', '#8B5CF6']

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 2,
      life: 1
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let active = false

    particles.forEach(p => {
      if (p.life > 0) {
        active = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.2
        p.life -= 0.02

        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    if (active) requestAnimationFrame(animate)
  }

  animate()
}

const formatDay = (dateStr) => new Date(dateStr).getDate()
const formatMonth = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short' })
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const getHarmonyColor = (category) => harmonyColors[category] || 'muted'
const getCategoryIcon = (category) => {
  const icons = {
    'Food': 'bi-cup-hot',
    'Transport': 'bi-car-front',
    'Shopping': 'bi-bag',
    'Entertainment': 'bi-film',
    'Bills': 'bi-receipt',
    'Health': 'bi-heart-pulse',
    'Other': 'bi-box',
    'send transfer': 'bi-arrow-up-right',
    'Salary': 'bi-cash-stack',
    'Bonus': 'bi-gift',
    'Get Transfer': 'bi-arrow-down-left'
  }
  return icons[category] || 'bi-circle'
}
</script>

<style>
/* ============================================
   HARMONY COLOR SYSTEM
   Analogous Palette: Teal-Cyan-Blue
   ============================================ */

:root {
  /* Primary Harmony Colors */
  --harmony-primary: #0D9488;
  /* Teal 600 */
  --harmony-primary-light: #14B8A6;
  /* Teal 500 */
  --harmony-primary-dark: #0F766E;
  /* Teal 700 */
  --harmony-primary-soft: #CCFBF1;
  /* Teal 100 */

  /* Secondary (Cyan) - Adjacent on wheel */
  --harmony-secondary: #06B6D4;
  /* Cyan 500 */
  --harmony-secondary-light: #22D3EE;
  /* Cyan 400 */
  --harmony-secondary-dark: #0891B2;
  /* Cyan 600 */
  --harmony-secondary-soft: #CFFAFE;
  /* Cyan 100 */

  /* Tertiary (Blue) - Adjacent on wheel */
  --harmony-tertiary: #3B82F6;
  /* Blue 500 */
  --harmony-tertiary-light: #60A5FA;
  /* Blue 400 */
  --harmony-tertiary-dark: #2563EB;
  /* Blue 600 */
  --harmony-tertiary-soft: #DBEAFE;
  /* Blue 100 */

  /* Accent Colors (Complementary harmony) */
  --harmony-accent1: #10B981;
  /* Emerald 500 - Success */
  --harmony-accent1-soft: #D1FAE5;
  /* Emerald 100 */
  --harmony-expense-soft: #FFE4E6;
  /* Rose 100 */

  --harmony-accent2: #8B5CF6;
  /* Violet 500 - Special */
  --harmony-accent2-soft: #EDE9FE;
  /* Violet 100 */

  --harmony-accent3: #F59E0B;
  /* Amber 500 - Warning */

  /* Functional Colors */
  --harmony-expense: #F43F5E;
  /* Rose 500 - Expenses */
  --harmony-expense-soft: #FFE4E6;
  /* Rose 100 */

  --harmony-neutral: #64748B;
  /* Slate 500 */
  --harmony-neutral-soft: #F1F5F9;
  /* Slate 100 */

  --harmony-muted: #94A3B8;
  /* Slate 400 */
  --harmony-light: #CBD5E1;
  /* Slate 300 */

  /* Backgrounds */
  --harmony-bg: #F0FDFA;
  /* Teal 50 */
  --harmony-card: rgba(255, 255, 255, 0.95);

  /* Gradients */
  --harmony-gradient-primary: linear-gradient(135deg, #0D9488 0%, #06B6D4 100%);
  --harmony-gradient-secondary: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
  --harmony-gradient-full: linear-gradient(135deg, #0D9488 0%, #06B6D4 50%, #3B82F6 100%);
}

/* ============================================
   BASE STYLES
   ============================================ */

.auth-loading-screen,
.auth-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #0f172a 0%, #155e75 55%, #0f766e 100%);
  overflow: hidden;
}

.auth-loading-card {
  color: white;
  text-align: center;
}

.auth-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.auth-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.35;
}

.auth-orb-1 {
  width: 320px;
  height: 320px;
  background: #0ea5e9;
  top: -80px;
  left: -60px;
}

.auth-orb-2 {
  width: 280px;
  height: 280px;
  background: #14b8a6;
  right: -60px;
  bottom: -60px;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  position: relative;
  z-index: 1;
  background: white;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 20px 50px rgba(2, 6, 23, 0.3);
}

.auth-switch {
  gap: 0.5rem;
}

.app-container {
  min-height: 100vh;
  position: relative;
  background: var(--harmony-bg);
  overflow-x: hidden;
}

.auth-user-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

/* Animated Background with Harmony Colors */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #F0FDFA 0%, #ECFEFF 50%, #EFF6FF 100%);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--harmony-primary);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: var(--harmony-secondary);
  bottom: -10%;
  right: -10%;
  animation-delay: -7s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: var(--harmony-tertiary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* ============================================
   HARMONY TEXT COLORS
   ============================================ */

.harmony-text-primary {
  color: var(--harmony-primary) !important;
}

.harmony-text-secondary {
  color: var(--harmony-secondary) !important;
}

.harmony-text-tertiary {
  color: var(--harmony-tertiary) !important;
}

.harmony-text-accent1 {
  color: var(--harmony-accent1) !important;
}

.harmony-text-accent2 {
  color: var(--harmony-accent2) !important;
}

.harmony-text-accent3 {
  color: var(--harmony-accent3) !important;
}

.harmony-text-expense {
  color: var(--harmony-expense) !important;
}

.harmony-text-neutral {
  color: var(--harmony-neutral) !important;
}

.harmony-text-muted {
  color: var(--harmony-muted) !important;
}

.harmony-text-light {
  color: var(--harmony-light) !important;
}

.harmony-text-dark {
  color: #1E293B !important;
}

.harmony-text-gradient {
  background: var(--harmony-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ============================================
   HARMONY BACKGROUNDS
   ============================================ */

.harmony-bg-primary {
  background-color: var(--harmony-primary) !important;
  color: white;
}

.harmony-bg-secondary {
  background-color: var(--harmony-secondary) !important;
  color: white;
}

.harmony-bg-tertiary {
  background-color: var(--harmony-tertiary) !important;
  color: white;
}

.harmony-bg-accent1 {
  background-color: var(--harmony-accent1) !important;
  color: white;
}

.harmony-bg-accent2 {
  background-color: var(--harmony-accent2) !important;
  color: white;
}

.harmony-bg-accent3 {
  background-color: var(--harmony-accent3) !important;
  color: white;
}

.harmony-bg-expense {
  background-color: var(--harmony-expense) !important;
  color: white;
}

.harmony-bg-neutral {
  background-color: var(--harmony-neutral) !important;
  color: white;
}

.harmony-bg-muted {
  background-color: var(--harmony-muted) !important;
  color: white;
}

.harmony-gradient-primary {
  background: var(--harmony-gradient-primary) !important;
  color: white;
}

/* ============================================
   TRANSACTION TOGGLE SWITCH
   ============================================ */

.transaction-toggle-wrapper {
  padding: 0 0 1rem 0;
}

.transaction-toggle {
  background: #F1F5F9;
  border-radius: 16px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transaction-toggle:hover {
  background: #E2E8F0;
}

.toggle-slider {
  display: flex;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.toggle-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748B;
}

.toggle-option i {
  font-size: 1.1rem;
}

.toggle-option.active {
  color: white;
}

.expense-option.active {
  color: white;
}

.income-option.active {
  color: white;
}

.toggle-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: var(--harmony-expense);
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
}

.transaction-toggle.income-active .toggle-indicator {
  transform: translateX(100%);
  background: var(--harmony-accent1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* ============================================
   TRANSACTION TYPE BADGE
   ============================================ */

.transaction-type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expense-badge {
  background: var(--harmony-expense-soft);
  color: var(--harmony-expense);
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.income-badge {
  background: var(--harmony-accent1-soft);
  color: var(--harmony-accent1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* ============================================
   AMOUNT INPUT WITH +/- INDICATOR
   ============================================ */

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  font-weight: 700;
  font-size: 1.2rem;
  z-index: 10;
  pointer-events: none;
}

.expense-symbol {
  color: var(--harmony-expense);
}

.income-symbol {
  color: var(--harmony-accent1);
}

.amount-input {
  padding-left: 2.5rem !important;
}

.amount-label {
  left: 2.5rem !important;
}

/* ============================================
   INCOME-SPECIFIC STYLES
   ============================================ */

.income-input:focus {
  border-color: var(--harmony-accent1) !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
}

.income-line {
  background: linear-gradient(90deg, var(--harmony-accent1), var(--harmony-primary)) !important;
}

/* ============================================
   BUTTON VARIANTS
   ============================================ */

.harmony-btn-expense {
  background: var(--harmony-gradient-primary) !important;
  border: none !important;
  color: white !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.harmony-btn-expense:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(13, 148, 136, 0.4) !important;
}

.harmony-btn-income {
  background: linear-gradient(135deg, var(--harmony-accent1) 0%, var(--harmony-primary) 100%) !important;
  border: none !important;
  color: white !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.harmony-btn-income:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4) !important;
}

/* ============================================
   OPTGROUP STYLING
   ============================================ */

optgroup {
  font-weight: 600;
  color: var(--harmony-primary);
}

optgroup option {
  font-weight: 400;
  padding: 0.5rem;
}

/* Animation for form card */
.slide-in-left {
  animation: slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse animation for icon */
.pulse-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

/* ============================================
   GLASS & CARDS
   ============================================ */

.glass-card {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.15);
}

.header-card {
  opacity: 0;
  transform: translateY(-30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: var(--harmony-gradient-primary) !important;
  border: none !important;
}

.header-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.harmony-shadow {
  box-shadow: 0 10px 40px -10px rgba(13, 148, 136, 0.2) !important;
  transition: box-shadow 0.3s, transform 0.3s;
}

.harmony-shadow:hover {
  box-shadow: 0 20px 60px -10px rgba(13, 148, 136, 0.3) !important;
}

/* Summary Cards */
.summary-card {
  background: var(--harmony-card) !important;
  border: 2px solid transparent !important;
  border-radius: 20px !important;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.summary-card.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.summary-card:hover {
  transform: translateY(-5px) scale(1.02);
}

.harmony-border-primary {
  border-color: var(--harmony-primary-soft) !important;
}

.harmony-border-secondary {
  border-color: var(--harmony-secondary-soft) !important;
}

.harmony-border-tertiary {
  border-color: var(--harmony-tertiary-soft) !important;
}

.harmony-border-accent1 {
  border-color: var(--harmony-accent1-soft) !important;
}

.harmony-border-accent2 {
  border-color: var(--harmony-accent2-soft) !important;
}

.harmony-border-expense {
  border-color: var(--harmony-expense-soft) !important;
}

.harmony-border-neutral {
  border-color: var(--harmony-neutral-soft) !important;
}

/* Icon Wrappers with Harmony Colors */
.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto;
  transform: rotate(0deg);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.summary-card:hover .icon-wrapper {
  transform: rotate(360deg) scale(1.1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

/* ============================================
   FORM STYLING
   ============================================ */

.form-card {
  background: var(--harmony-card) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(13, 148, 136, 0.1) !important;
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.form-card.slide-in-left {
  opacity: 1;
  transform: translateX(0);
}

.harmony-input {
  border: 2px solid #E2E8F0 !important;
  border-radius: 12px !important;
  background: #F8FAFC !important;
  transition: all 0.3s !important;
}

.harmony-input:focus {
  border-color: var(--harmony-primary) !important;
  background: white !important;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1) !important;
  transform: translateY(-2px);
}

.harmony-label {
  color: var(--harmony-neutral) !important;
}

.harmony-line {
  background: var(--harmony-gradient-primary) !important;
}

/* Buttons */
.harmony-btn {
  background: var(--harmony-gradient-primary) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.harmony-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(13, 148, 136, 0.4) !important;
}

.harmony-btn-primary {
  background: var(--harmony-primary) !important;
  border-color: var(--harmony-primary) !important;
  color: white !important;
}

.harmony-btn-outline {
  border: 2px solid var(--harmony-primary) !important;
  color: var(--harmony-primary) !important;
  background: transparent !important;
  transition: all 0.3s;
}

.harmony-btn-outline:hover {
  background: var(--harmony-primary-soft) !important;
  color: var(--harmony-primary-dark) !important;
}

.harmony-btn-danger-outline {
  border: 2px solid var(--harmony-expense) !important;
  color: var(--harmony-expense) !important;
  background: transparent !important;
}

.harmony-btn-danger-outline:hover {
  background: var(--harmony-expense-soft) !important;
}

/* ============================================
   CHARTS & ANALYTICS
   ============================================ */

.chart-card {
  background: var(--harmony-card) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(13, 148, 136, 0.1) !important;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chart-card.fade-in-scale {
  opacity: 1;
  transform: scale(1);
}

.category-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.harmony-icon-shadow {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.category-item:hover .category-icon {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.harmony-progress {
  background: var(--harmony-gradient-primary) !important;
}

/* ============================================
   TRANSACTIONS TABLE
   ============================================ */

.transactions-card {
  background: var(--harmony-card) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(13, 148, 136, 0.1) !important;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.transactions-card.fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.harmony-table-header {
  background: linear-gradient(135deg, #F0FDFA 0%, #ECFEFF 100%) !important;
}

.harmony-table-header th {
  font-weight: 600;
  border-bottom: 2px solid var(--harmony-primary-soft) !important;
}

.transaction-row {
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.transaction-row:hover {
  background: #F0FDFA !important;
  border-left-color: var(--harmony-primary);
  transform: translateX(5px);
}

.date-badge {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  line-height: 1;
  box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
}

.date-badge .day {
  font-size: 1.2rem;
  font-weight: bold;
}

.date-badge .month {
  font-size: 0.7rem;
  text-transform: uppercase;
  opacity: 0.9;
}

.harmony-badge {
  padding: 0.6em 1.2em !important;
  border-radius: 20px !important;
  font-weight: 500 !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.harmony-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.harmony-btn-delete {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 2px solid var(--harmony-expense) !important;
  color: var(--harmony-expense) !important;
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transform: scale(0.8);
}

.transaction-row:hover .harmony-btn-delete {
  opacity: 1;
  transform: scale(1);
}

.harmony-btn-delete:hover {
  background: var(--harmony-expense) !important;
  color: white !important;
  transform: rotate(90deg) !important;
}

/* ============================================
   TOASTS
   ============================================ */

.harmony-toast {
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

/* ============================================
   ANIMATIONS & EFFECTS
   ============================================ */

.shimmer-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 200%;
  }
}

.bounce-icon {
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.pulse-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.cursor-blink {
  animation: blink 1s infinite;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

.floating-icons {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  font-size: 2rem;
  animation: float-icon 6s infinite ease-in-out;
  opacity: 0.6;
}

.floating-icon:nth-child(1) {
  top: 20%;
  left: 10%;
}

.floating-icon:nth-child(2) {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.floating-icon:nth-child(3) {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float-icon {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Confetti */
.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

/* Fade In Up */
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.fade-in-up.show {
  opacity: 0.9;
  transform: translateY(0);
}

/* Empty State */
.empty-animation {
  animation: float 3s infinite ease-in-out;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--harmony-bg);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: var(--harmony-gradient-primary);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--harmony-primary-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .display-4 {
    font-size: 2rem;
  }

  .summary-card {
    margin-bottom: 1rem;
  }

  .floating-icon {
    display: none;
  }
}
</style>
