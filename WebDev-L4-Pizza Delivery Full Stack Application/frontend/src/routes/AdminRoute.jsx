import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return user && user.role === 'Admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
