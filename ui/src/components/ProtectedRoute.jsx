// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import ErrorCard from './ErrorCard';
import { useIsAuthenticated, useHasRole } from '../utils/auth';

const ProtectedRoute = ({ element, requiredRoles }) => {
  const isAuthenticated = useIsAuthenticated();
  const hasRole = useHasRole(requiredRoles);

  if (!isAuthenticated) {
    return <ErrorCard message="You must be logged in to view this page." buttonLabel="Go to Login" redirectLink="/login" />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole) {
    return <ErrorCard message="You are not authorized to view this page." buttonLabel="Go back" redirectLink="/" />;
  }

  return element;
};

export default ProtectedRoute;
