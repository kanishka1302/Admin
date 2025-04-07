import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Shops from './pages/Shops/Shops';
import AddShop from './pages/AddShop/AddShop';
import AdminBanner from './components/AdminBanner/AdminBanner';
import { AuthProvider, useAuth } from './AuthContext/AuthContext';
import PrivateRoute from './components/privateRoute/privateRoute';

import './App.css';

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <AdminBanner />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/add" element={<PrivateRoute><Add /></PrivateRoute>} />
      <Route path="/addshop" element={<PrivateRoute><AddShop /></PrivateRoute>} />
      <Route path="/list" element={<PrivateRoute><List /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/dashboard/shops" element={<PrivateRoute><Shops /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
