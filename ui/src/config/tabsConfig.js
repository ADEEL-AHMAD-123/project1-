import React from 'react';
import { FaChartBar, FaUser, FaCog, FaUsers, FaObjectGroup, FaServer, FaStore, FaClipboardList, FaUserCircle } from 'react-icons/fa';
import { HiTrendingUp } from 'react-icons/hi'; // Import Heroicons

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
    path: '/logs',
    label: 'Logs',
    icon: FaClipboardList,
    roles: ['admin', 'supportive staff'],
  },
  {
    path: '/usage',
    label: 'Usage',
    icon: HiTrendingUp, // Heroicons icon for usage
    roles: ['admin', 'supportive staff', 'client'], // Adjust roles as needed
  },
];
