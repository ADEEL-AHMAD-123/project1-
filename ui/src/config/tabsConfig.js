import { FaCog, FaUsers, FaUserCircle, FaObjectGroup, FaUser, FaChartBar, FaServer, FaStore, FaClipboardList } from 'react-icons/fa'; // Import the FaClipboardList icon for logs

export const tabsConfig = [
  {
    path: '/',
    label: 'Dashboard',
    icon: FaChartBar,
    roles: ['admin', 'supportive staff', 'client'], 
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: FaUser,
    roles: ['admin', 'supportive staff', 'client'], 
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
  {
    path: '/servers',
    label: 'Servers',
    icon: FaServer,
    roles: ['admin', 'supportive staff', 'client'], 
  },
  {
    path: '/vendors',
    label: 'Vendors',
    icon: FaStore,
    roles: ['admin', 'supportive staff'],
  },
  {
    path: '/logs', // Add this entry for logs
    label: 'Logs',
    icon: FaClipboardList, // Use the FaClipboardList icon for logs
    roles: ['admin', 'supportive staff'], // Visible to admin and supportive staff
  },
];
