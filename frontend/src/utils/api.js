import axios from 'axios';

// ============================================
// FIX 4 (THE MAIN FIX):
// Dynamically build the API URL using the
// hostname the browser is currently on.
//
// If you open the app via http://192.168.1.5:3000
// the API calls will go to http://192.168.1.5:5000
//
// If you open via http://localhost:3000
// the API calls will go to http://localhost:5000
// ============================================
function getBaseURL() {
  // 1. If an env var is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Use the same hostname the browser is on,
  //    but point to the backend port (5000)
  const hostname = window.location.hostname; // e.g. "192.168.1.5" or "localhost"
  const protocol = window.location.protocol;  // "http:" or "https:"
  const backendPort = 5000;

  return `${protocol}//${hostname}:${backendPort}/api`;
}

const API_BASE = getBaseURL();

console.log('🌐 API Base URL:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 15 second timeout for slow networks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't override Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Better error logging for debugging on mobile
    if (error.code === 'ERR_NETWORK') {
      console.error(
        '❌ Network Error - Cannot reach server at:',
        API_BASE,
        '\nMake sure the backend is running and accessible.'
      );
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE };