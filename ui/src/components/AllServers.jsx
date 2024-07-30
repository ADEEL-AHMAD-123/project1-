import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import ErrorCard from '../components/ErrorCard';
import { serverAsyncActions } from '../redux/slices/serverSlice';
import "../styles/ListingTable.scss";

const AllServers = () => { 
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const { Servers, loading, error } = useSelector(state => state.servers);
  const { Role } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(serverAsyncActions.getServers({ requestData: `${Role === "client" ? "/user" : ""}` }));
  }, [dispatch, Role]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleRowClick = (serverId) => {
    navigate(`${serverId}`); // Navigate to the server detail page
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'initializing':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'pending':
        return 'pending';
      default:
        return 'unknown';
    }
  };

  if (loading && !Servers) {
    return (
      <div className="container servers">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  if (error && !Servers) {
    return (
      <div className="container servers">
        <ErrorCard message={error} />
      </div>
    );
  }

  return (
    <div className="container servers">
      {Servers && Servers.length === 0 ? (
        <h1 className="message">No servers available.</h1>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Server Name</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Username</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Servers.map(server => (
                <tr key={server._id} onClick={() => handleRowClick(server._id)}>
                  <td>{server.serverName}</td>
                  <td>{server.agentCredentials.sipIpAddress}</td>
                  <td>
                    {server.dialerLocation && server.dialerLocation.city} {server.dialerLocation && server.dialerLocation.country}
                  </td>
                  <td>{server.companyUser.firstName} {server.companyUser.lastName}</td>
                  <td>{formatDate(server.createdAt)}</td>
                  <td className={`status ${getStatusClass(server.status)}`}>{server.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllServers;
