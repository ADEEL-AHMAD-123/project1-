import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { userAsyncActions,resetUserState } from '../redux/slices/userSlice';
import { billingAsyncActions,resetBillingState } from '../redux/slices/billingSlice';
import {  resetDIDState } from '../redux/slices/didSlice'; 
import { resetOrderState } from '../redux/slices/orderSlice'; 
import { resetLogState } from '../redux/slices/logSlice'; 
import { cartAsyncActions } from '../redux/slices/cartSlice'; 
import { resetPaymentState } from '../redux/slices/paymentSlice'; 
import { resetServerState } from '../redux/slices/serverSlice'; 
import { resetVendorState } from '../redux/slices/vendorSlice'; 
import { persistor } from '../redux/store/store'; 
import "../styles/Dashboard.scss";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.User);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = async () => {
    try {
      // Dispatch the logout action
      await dispatch(userAsyncActions.logoutUser({ requestData: "" }));
      
      // Purge the persisted state (clear localStorage/sessionStorage)
      persistor.purge();
      
      // Dispatch reset actions for all slices
      dispatch(resetUserState());
      dispatch(resetDIDState());
      dispatch(resetOrderState());
      dispatch(resetLogState());
      dispatch(resetBillingState()); 
      dispatch(resetPaymentState()); 
      dispatch(resetServerState()); 
      dispatch(resetVendorState()); 
      dispatch(cartAsyncActions.resetCart()); 
      
      // Optionally, redirect to the login page or home page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleActivation = () => {
    dispatch(billingAsyncActions.createBillingAccount({ requestData: "?module=user" }));
  };

  // Check if user is available before rendering
  if (!user) {
    return <p>Loading...</p>; // or any other loading indicator
  }

  return (
    <div className="dashboard">
      <h1>{`${getGreeting()}, ${user.firstName} ${user.lastName}`}</h1>
      <div className="user-details">
        <h4>You are logged in as a {user.role.toUpperCase()}</h4>
        <button onClick={handleLogout} className="btn">Logout</button>
        {/* Render activation button only if role is 'client' and billing account is not present */}
        {user.role === 'client' && !user.hasBillingAccount && (
          <button onClick={handleActivation} className="btn">Activate Billing Account</button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
