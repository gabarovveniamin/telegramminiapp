import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Automatically add Telegram WebApp initData to headers
api.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    config.headers['X-Telegram-Init-Data'] = tg.initData;
  } else {
    console.warn('API call without Telegram initData');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('unauthorized-access'));
    }
    return Promise.reject(error);
  }
);

export default api;
