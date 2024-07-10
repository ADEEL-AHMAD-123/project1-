// App.js
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/main.scss';
import AccountSettings from './pages/AccountSetting';
import TeamPage from './pages/TeamPage';
console.log(process.env.REACT_APP_API_BASE_URL,'jj');
function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app">
      <Topbar toggleSidebar={toggleSidebar} />
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} requiredRoles={['admin', 'supportive staff', 'client']} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/team" element={<ProtectedRoute element={<TeamPage />} requiredRoles={['admin', 'supportive staff']} />} />
          <Route path="/account-settings" element={<ProtectedRoute element={<AccountSettings />} requiredRoles={['admin', 'supportive staff']} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
