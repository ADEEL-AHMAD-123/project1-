// utils/auth.js
import { useSelector } from 'react-redux';

export const useIsAuthenticated = () => {
  const user = useSelector((state) => state.user.User);
  console.log('udygxhjzk',user);
  return !!user;
};

export const useHasRole = (requiredRole) => {
  const role = useSelector((state) => state.user.Role);
  return role === requiredRole;
};
