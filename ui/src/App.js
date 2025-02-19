import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import './styles/main.scss';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerificationInfo from './pages/EmailVerificationInfo';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/DashboardPage';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AccountSettings from './pages/AccountSettingPage';
import TeamPage from './pages/TeamPage';
import ServerPage from './pages/ServerPage';
import Summary from './pages/UsagePage';
import ErrorCard from './components/ErrorCard';
import VendorPage from './pages/VenderPage.jsx';
import LogsPage from './pages/LogsPage';
import ServerDetails from './pages/ServerDetails';
import CartPage from './pages/CartPage';  
import CheckOutPage from './pages/CheckOutPage';  
import OrderSuccessPage from './pages/OrderSuccessPage';
import DIDPage from './pages/DIDsPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import DIDManagementPage from './pages/DIDManagementPage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
      setIsSidebarOpen((prev) => !prev);
  };

  const dispatch = useDispatch();
 


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
              message={
                <>
                <h2 style={{fontSize:"4rem",marginBottom:"-20px"}}>
                404
                </h2>
           
                  <br />
                  Page not found
                </>
              }
                buttonLabel="Go Back"
              />
            } 
          />

          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/email-verification-info" element={<EmailVerificationInfo />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />


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
          <Route path="/checkout" element={<ProtectedRoute element={<CheckOutPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />  
          <Route path="/order-success" element={<ProtectedRoute element={<OrderSuccessPage />} requiredRoles={['admin', 'supportive staff', 'client']} />} />  

          {/* Dashboard */}
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} requiredRoles={['admin', 'supportive staff', 'client']} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
