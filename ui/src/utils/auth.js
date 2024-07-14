import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import ErrorCard from './ErrorCard';

const getTokenFromCookies = () => {
  return Cookies.get('token'); // Adjust the key as per your token name in the cookies
};

const isTokenValid = (token) => { 
  if (!token) return false;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const ProtectedRoute = ({ element, requiredRoles }) => {
  const user = useSelector((state) => state.user.User);
  const userRole = useSelector((state) => state.user.Role);
  const token = getTokenFromCookies();

  const isAuthenticated = !!user && isTokenValid(token);
  const hasRole = requiredRoles && requiredRoles.length > 0 ? requiredRoles.includes(userRole) : true;

  if (!isAuthenticated) {
    return <ErrorCard message="You must be logged in to view this page." buttonLabel="Go to Login" redirectLink="/login" />;
  }

  if (!hasRole) {
    return <ErrorCard message="You are not authorized to view this page." buttonLabel="Go back" redirectLink="/" />;
  }

  return element;
};

export default ProtectedRoute;
