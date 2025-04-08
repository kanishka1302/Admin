import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// AuthProvider component to wrap around your app
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedValue = localStorage.getItem("adminLoggedIn");
    return storedValue === "true"; // Convert string to boolean
  });

  const [justLoggedIn, setJustLoggedIn] = useState(false); // ⬅️ new state

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("adminLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  // Login and logout handlers
  const login = () => {
    setIsLoggedIn(true);
    setJustLoggedIn(true); // ⬅️ mark just logged in
  };

  const logout = () => {
    setIsLoggedIn(false);
    setJustLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, justLoggedIn, setJustLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
