import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { userInfo, loading } = useAuth();

  if (loading) {
    // If we are still checking for a user, show a loading message
    return <div>Loading...</div>;
  }

  // If we are done loading and there's a user, show the page.
  // Otherwise, redirect to login.
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;