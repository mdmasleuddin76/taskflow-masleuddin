// src/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global Error Handler
apiClient.interceptors.response.use(
  (response) => {
    // If the request succeeds, just pass the response through
    return response;
  },
  (error) => {
    // 1. Handle Network Errors (Backend is down or internet is disconnected)
    if (!error.response) {
      console.error("Network Error: Please check your connection or ensure the backend is running.");
      return Promise.reject(error);
    }

    // 2. Handle Unauthorized (Cookie missing, expired, or invalid)
    if (error.response.status === 401) {
      // Prevent redirect looping if they are already on the login or signup page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
         window.location.href = '/login';
      }
    }

    // 3. Return the error so the specific component can display a message (e.g., "Invalid password")
    return Promise.reject(error);
  }
);

export default apiClient;