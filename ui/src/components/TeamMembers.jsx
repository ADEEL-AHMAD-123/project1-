import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ErrorCard from '../components/ErrorCard';
import { userAsyncActions } from '../redux/slices/userSlice';
import "../styles/ListingTable.scss";

const TeamMembers = () => {
  const dispatch = useDispatch();
  const { Team, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(userAsyncActions.getTeam({ Data: "" }));
  }, [dispatch]);

  if (loading && !Team) {
    return (
      <div className="container team-members">
        <h1 className="heading">Team Members</h1>
        <p className="loading">Loading...</p>
      </div>
    );
  }

  if (error && !Team) {
    return (
      <div className="container team-members">
        <ErrorCard message={error} />
      </div>
    );
  }

  // Team data is available, render the table
  return (
    <div className="container team-members">
      {Team && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Picture</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Zipcode</th>
              </tr>
            </thead>
            <tbody>
              {Team.map(member => (
                <tr key={member._id}>
                  <td>
                    <img 
                      src={member.avatar?.url || 'default-avatar.png'} 
                      alt="avatar" 
                      className="avatar" 
                    />
                  </td>
                  <td>{`${member.firstName} ${member.lastName}`}</td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                  <td>{member.phone}</td>
                  <td>{member.zipcode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
