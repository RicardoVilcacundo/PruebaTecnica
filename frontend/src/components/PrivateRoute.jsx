import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const PrivateRoute = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // eslint-disable-next-line no-undef
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
};

export default PrivateRoute;