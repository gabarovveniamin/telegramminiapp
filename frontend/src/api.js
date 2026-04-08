import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This is the standard prefix
});

// Add Telegram data to headers
api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});

export default api;
