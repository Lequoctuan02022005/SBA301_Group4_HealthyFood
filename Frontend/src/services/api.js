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
  (config) => config,
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
    return Promise.reject(error);
  }
);

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

// ─── Categories ──────────────────────────────────────────────────
export const getCategories = () => api.get('/categories');

export default api;
