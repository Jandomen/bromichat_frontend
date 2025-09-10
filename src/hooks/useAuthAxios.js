import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuthAxios = () => {
  const { token } = useContext(AuthContext);

  const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BACKEND,
  });

  authAxios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return authAxios;
};

export default useAuthAxios;
