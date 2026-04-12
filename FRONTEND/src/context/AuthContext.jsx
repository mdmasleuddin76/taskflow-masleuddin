// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getMe, registerUser } from '../api/auth'; // <-- Make sure registerUser is imported!

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial load check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data.user); // Saves user to memory
  };

  // --- NEW: Add the register function ---
  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    setUser(data.user); // Instantly logs them in by saving user to memory!
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    // Make sure 'register' is passed down in the value object!
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};