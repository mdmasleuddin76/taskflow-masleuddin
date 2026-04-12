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
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Network Error: Please check your connection or ensure the backend is running.");
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Define all routes that are allowed to be viewed without logging in
      const publicRoutes = ['/login', '/signup', '/']; 

      // Only redirect if they are NOT on a public route
      if (!publicRoutes.includes(currentPath)) {
         window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;