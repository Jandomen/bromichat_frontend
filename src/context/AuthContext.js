import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    return storedUser || null;
  });
  const [token, setToken] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    return storedUser?.token || null;
  });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
         // console.log('Depuración - currentUser cargado desde /auth/me:', res.data);
          const userWithToken = { ...res.data, token };
          setUser(userWithToken);
          localStorage.setItem('user', JSON.stringify(userWithToken));
        } catch (err) {
         // console.error('Error al cargar currentUser:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
        }
      }
      setLoadingUser(false);
    };
    fetchUser();
  }, [token]);

  const login = ({ token, user }) => {
    const userWithToken = { ...user, token };
    localStorage.setItem('user', JSON.stringify(userWithToken));
    setUser(userWithToken);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
