import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../layout/MainLayout';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>; // or a spinner component
  }
  
  return isAuthenticated && user?.role === 'admin' ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;