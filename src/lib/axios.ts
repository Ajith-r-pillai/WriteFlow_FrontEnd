import axios from 'axios';

export const axiosInstance = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL, 
 withCredentials: true, 
});

// Automatically attach token if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
