import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../layout/MainLayout';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>; // or a spinner component
  }
  
  return isAuthenticated ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;