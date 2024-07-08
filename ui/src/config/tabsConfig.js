// config/tabsConfig.js
import { FaCog, FaUsers, FaUserCircle, FaObjectGroup, FaUser, FaChartBar } from 'react-icons/fa';

export const tabsConfig = [
  {
    path: '/',
    label: 'Dashboard',
    icon: FaChartBar,
    roles: ['admin', 'supportive staff', 'client'], // Visible to all roles
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: FaUser,
    roles: ['admin', 'supportive staff', 'client'], // Visible to all roles
  },
  {
    path: '/account-settings',
    label: 'Account Settings',
    icon: FaCog,
    roles: ['admin', 'supportive staff'],
  },
  {
    path: '/team',
    label: 'Team',
    icon: FaUsers,
    roles: ['admin'],
  },
  {
    path: '/roles',
    label: 'Roles',
    icon: FaUserCircle,
    roles: ['admin'],
  },
  {
    path: '/groups',
    label: 'Groups',
    icon: FaObjectGroup,
    roles: ['admin'],
  },
  // Add more tabs here as needed
];
