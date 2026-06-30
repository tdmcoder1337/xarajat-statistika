import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://xarajat-backend.vercel.app/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  const guestId = localStorage.getItem('guestId');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else if (guestId) {
    config.headers['X-Guest-Id'] = guestId;
  }
  return config;
});

export const getTransactions = (params) => api.get('/transactions', { params });
export const getDailySummary = (date) => api.get('/transactions/daily', { params: { date } });
export const getMonthlySummary = (month, year) =>
  api.get('/transactions/monthly', { params: { month, year } });
export const createTransaction = (data) => api.post('/transactions', data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export const getEssentials = () => api.get('/essentials');
export const createEssential = (data) => api.post('/essentials', data);
export const updateEssential = (id, data) => api.put(`/essentials/${id}`, data);
export const deleteEssential = (id) => api.delete(`/essentials/${id}`);
