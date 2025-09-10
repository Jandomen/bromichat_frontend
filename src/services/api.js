import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BACKEND, 
});

api.interceptors.request.use(
  (config) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
