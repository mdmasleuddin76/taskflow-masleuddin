// src/api/auth.js
import apiClient from './client';

export const registerUser = async (name, email, password) => {
  const response = await apiClient.post('/auth/register', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data; // Expected: { user: { id, name, email } }
};

export const logoutUser = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  // Used by AuthContext on page refresh to verify the cookie
  const response = await apiClient.get('/auth/me');
  return response.data;
};