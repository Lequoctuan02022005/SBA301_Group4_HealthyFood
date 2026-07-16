import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    'user_type': 'admin', 
    'user_id': '1', 
  },
});

// ─── Request Interceptor ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Authentication ──────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// ─── Products ────────────────────────────────────────────────────
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (formData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ─── Subscriptions ───────────────────────────────────────────────
export const getSubscriptions = () => api.get('/subscriptions');
export const getSubscriptionById = (id) => api.get(`/subscriptions/${id}`);
export const buySubscription = (userId, packageId) =>
  api.post(`/subscriptions/buy?userId=${userId}&packageId=${packageId}`);

// ─── Payments (VNPay) ────────────────────────────────────────────
export const createOrderPayment = (userId, orderId) =>
  api.post(`/payment/create_order_payment?userId=${userId}&orderId=${orderId}`);

export const createSubscriptionPayment = (userId, packageId) =>
  api.post(`/payment/create_subscription_payment?userId=${userId}&packageId=${packageId}`);

// ─── Categories ──────────────────────────────────────────────────
export const getCategories = () => api.get('/categories');

// ─── Manager Products ────────────────────────────────────────────
export const getPendingProducts = () => api.get('/manager/products/pending');
export const getManagerProductDetail = (id) => api.get(`/manager/products/${id}`);
export const approveProduct = (id) => api.patch(`/manager/products/${id}/approve`);
export const rejectProduct = (id, reviewComment) =>
  api.patch(`/manager/products/${id}/reject?reviewComment=${encodeURIComponent(reviewComment)}`);
export const publishProduct = (id) => api.patch(`/manager/products/${id}/publish`);
export const hideProduct = (id, reviewComment) =>
  api.patch(`/manager/products/${id}/hide?reviewComment=${encodeURIComponent(reviewComment)}`);

export default api;
