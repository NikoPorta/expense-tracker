import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || import.meta.env.ENVIRONMENT || 'development';
const IS_PRODUCTION = ENVIRONMENT === 'production';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const LOCAL_SESSION_KEY = 'expense_tracker_local_session';

const readLocalSession = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const saveLocalSession = (session) => {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
};

const toLocalPublicUser = (user) => ({
  id: user.id,
  uid: String(user.id),
  name: user.name || '',
  email: user.email
});

const toFirebasePublicUser = (user) => ({
  id: user.uid,
  uid: user.uid,
  name: user.displayName || '',
  email: user.email || ''
});

class AuthService {
  static async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Auth request failed');
    }

    return data;
  }

  static isProduction() {
    return IS_PRODUCTION;
  }

  static onAuthStateChange(callback) {
    if (IS_PRODUCTION) {
      return onAuthStateChanged(auth, (user) => {
        callback(user ? toFirebasePublicUser(user) : null);
      });
    }

    callback(readLocalSession());
    return () => {};
  }

  static async register({ name, email, password }) {
    if (IS_PRODUCTION) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name && name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      return toFirebasePublicUser(auth.currentUser || credential.user);
    }

    const result = await this.request('/auth/register', {
      method: 'POST',
      body: {
        name,
        email,
        password
      }
    });

    const sessionUser = toLocalPublicUser(result.data);
    saveLocalSession(sessionUser);
    return sessionUser;
  }

  static async login({ email, password }) {
    if (IS_PRODUCTION) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return toFirebasePublicUser(credential.user);
    }

    const result = await this.request('/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    });

    const sessionUser = toLocalPublicUser(result.data);
    saveLocalSession(sessionUser);
    return sessionUser;
  }

  static async logout() {
    if (IS_PRODUCTION) {
      await signOut(auth);
      return;
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

export default AuthService;
