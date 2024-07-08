// utils/auth.js
import { useSelector } from 'react-redux';

export const useIsAuthenticated = () => {
  const user = useSelector((state) => state.user.User);
  return !!user;
};

export const useHasRole = (requiredRoles) => {
  const userRole = useSelector((state) => state.user.Role);

  if (!requiredRoles || !Array.isArray(requiredRoles)) {
    // If requiredRoles is not defined or not an array, return false
    return false;
  }

  // Check if userRole exists and if it matches any of the requiredRoles
  const hasRole = requiredRoles.some(role => role === userRole);

  return hasRole;
};
