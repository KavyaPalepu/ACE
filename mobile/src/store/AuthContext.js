import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
    } catch (e) {
      if (!e.response) {
        alert('Network Error: Cannot reach the backend. If testing on a physical phone, you MUST change API_URL in src/api/index.js to your computer\'s Wi-Fi IPv4 address instead of localhost/10.0.2.2!');
      } else {
        alert(e.response.data?.message || 'Login failed');
      }
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
    } catch (e) {
      if (!e.response) {
        alert('Network Error: Cannot reach the backend. If testing on a physical phone, you MUST change API_URL in src/api/index.js to your computer\'s Wi-Fi IPv4 address!');
      } else {
        alert(e.response.data?.message || 'Registration failed');
      }
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
