import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// const BASE_URL = 'https://books-project-production.up.railway.app/api/v1';
const BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
