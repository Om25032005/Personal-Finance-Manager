import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setError(null);
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request reset link';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    setError(null);
    try {
      const res = await api.put(`/auth/resetpassword/${resetToken}`, { password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Password reset failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Update profile details
  const updateProfileDetails = async (name, email) => {
    setError(null);
    try {
      const res = await api.put('/profile', { name, email });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Change password
  const changeUserPassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      const res = await api.put('/profile/password', { currentPassword, newPassword });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Password update failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Upload avatar
  const uploadUserAvatar = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Avatar upload failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfileDetails,
        changeUserPassword,
        uploadUserAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
