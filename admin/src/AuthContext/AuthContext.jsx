import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// AuthProvider component to wrap around your app
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedValue = localStorage.getItem("adminLoggedIn");
    return storedValue === "true"; // Convert string to boolean
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("adminLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  // Login and logout handlers
  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
