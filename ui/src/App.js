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
import ServerPage from './pages/ServerPage';
import Summary from './pages/UsagePage';
import ErrorCard from './components/ErrorCard';
import VendorPage from './pages/VenderPage.jsx';
import LogsPage from './pages/LogsPage';
import ServerDetails from './pages/ServerDetails';
import CartPage from './pages/CartPage';  // Import CartPage

// New Imports for DIDs, Orders, and Payment
import DIDPage from './pages/DIDsPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import DIDManagementPage from './pages/DIDManagementPage';

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
          {/* Default error route */}
          <Route 
            path="*" 
            element={
              <ErrorCard
                message="Some custom logic needed here."
                buttonLabel="Perform Action"
              />
            } 
          />

          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          {/* DID Selection, Order, and Payment routes */}
          <Route path="/dids" element={<ProtectedRoute element={<DIDPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />
          <Route path="/orders/:orderId" element={<ProtectedRoute element={<OrderSummaryPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />
          <Route path="/manage-dids" element={<ProtectedRoute element={<DIDManagementPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />

          {/* Server routes */}
          <Route path="/servers/:id" element={<ProtectedRoute element={<ServerDetails />} requiredRoles={['admin', 'supportive staff', 'client']} />} />

          <Route path="/servers" element={<ProtectedRoute element={<ServerPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />

          {/* Vendor and Log routes */}
          <Route path="/vendors" element={<ProtectedRoute element={<VendorPage />} requiredRoles={['admin', 'supportive staff']} />} />
          <Route path="/logs" element={<ProtectedRoute element={<LogsPage />} requiredRoles={['admin', 'supportive staff']} />} />

          {/* Usage routes */}
          <Route path="/usage" element={<ProtectedRoute element={<Summary />} requiredRoles={['admin', 'supportive staff','client']} />} />

          {/* Profile, Team, Account Settings */}
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} requiredRoles={['admin', 'supportive staff', 'client']} />} />
          <Route path="/team" element={<ProtectedRoute element={<TeamPage />} requiredRoles={['admin', 'supportive staff']} />} />
          <Route path="/account-settings" element={<ProtectedRoute element={<AccountSettings />} requiredRoles={['admin', 'supportive staff']} />} />

          {/* Cart Page Route */}
          <Route path="/cart" element={<ProtectedRoute element={<CartPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />  

          {/* Dashboard */}
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} requiredRoles={['admin', 'supportive staff', 'client']} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
