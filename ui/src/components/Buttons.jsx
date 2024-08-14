import React from 'react';
import { useDispatch } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';
import { billingAsyncActions } from '../redux/slices/billingSlice';


const ActionButton = ({ label, onClick, className, style, disabled }) => (
  <button 
    onClick={onClick} 
    className={className} 
    style={style} 
    disabled={disabled}
  >
    {label}
  </button>
);

const Buttons = () => {
  const dispatch = useDispatch();

  // Define buttons with their respective logic here
  const LogoutButton = () => (
    <ActionButton 
      label="Logout" 
      onClick={() => dispatch(userAsyncActions.logoutUser())} 
      className="btn btn-logout" 
    />
  );

  const ActivateButton = ({ userId }) => (
    <ActionButton 
      label="Activate Billing Account" 
      onClick={() => dispatch(billingAsyncActions.createBillingAccount(userId))} 
      className="btn btn-activate" 
    />
  );


  return {
    LogoutButton,
    ActivateButton
  };
};

export default Buttons;
