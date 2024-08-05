// App.js
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashboardPage';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/main.scss';
import AccountSettings from './pages/AccountSettingPage';
import TeamPage from './pages/TeamPage';
import ServerPage from './pages/ServerPage'
import UsagePage from './pages/UsagePage'
import ErrorCard from './components/ErrorCard';
import VendorPage from './pages/VenderPage';
import LogsPage from './pages/LogsPage';
import ServerDetails from './pages/ServerDetails';

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
        <Route path="*" element={<ErrorCard message={"404. Not Found"} buttonLabel="Go back" redirectLink="/" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          <Route path="/servers/:id" element={<ProtectedRoute element={<ServerDetails />} requiredRoles={['admin', 'supportive staff', 'client']} />}  />

          <Route path="/vendors" element={<ProtectedRoute element={<VendorPage />} requiredRoles={['admin', 'supportive staff']} />} />

          <Route path="/logs" element={<ProtectedRoute element={<LogsPage />} requiredRoles={['admin', 'supportive staff']} />}  />

          <Route path="/usage" element={<ProtectedRoute element={<UsagePage />} requiredRoles={['admin', 'supportive staff','client']} />}  />

          <Route path="/" element={<ProtectedRoute element={<Dashboard />} requiredRoles={['admin', 'supportive staff', 'client']} />} />

          <Route path="/profile" element={<ProtectedRoute element={<Profile />} requiredRoles={['admin', 'supportive staff', 'client']} />} />



          <Route path="/team" element={<ProtectedRoute element={<TeamPage />} requiredRoles={['admin', 'supportive staff']} />} />

          <Route path="/account-settings" element={<ProtectedRoute element={<AccountSettings />} requiredRoles={['admin', 'supportive staff']} />} />

          <Route path="/servers" element={<ProtectedRoute element={<ServerPage />} requiredRoles={['admin', 'supportive staff', 'client']} />}   />
        </Routes>
      </div>
    </div>
  );
}

export default App;
