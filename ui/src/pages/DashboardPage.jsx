import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';
import "../styles/Dashboard.scss";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.User);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => {
    dispatch(userAsyncActions.logoutUser({requestData:""}));
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
      </div>
    </div>
  );
};

export default Dashboard;
