import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { serverAsyncActions } from '../redux/slices/serverSlice';
import ErrorCard from './ErrorCard';
import Loader from './Loader';
import '../styles/ListingTable.scss';

const AllServers = () => {
  const dispatch = useDispatch();
  const { isLoading, error, Servers, pagination = {} } = useSelector((state) => state.servers);
  const { Role } = useSelector((state) => state.user);

  const initialFilters = {
    createdAt: '',
    location: '',
    serverName: '',
    status: '',
    page: 1,
    limit: 10,
  };

  const storageKey = 'allServersFilters';
  const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem(storageKey)) || initialFilters);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isModified, setIsModified] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);

  useEffect(() => {
    const isFilterModified = JSON.stringify({ ...localFilters, page: filters.page }) !== JSON.stringify(filters);
    setIsModified(isFilterModified);
    setIsApplyButtonDisabled(!isFilterModified);
    setIsResetButtonDisabled(!isApplied && JSON.stringify(localFilters) === JSON.stringify(initialFilters));
  }, [localFilters, filters, isApplied]);

  useEffect(() => {
    applyFilters(filters); // Apply filters on page load
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const filtersWithPageReset = { ...localFilters, page: 1 }; // Reset page to 1 on filter apply
    setFilters(filtersWithPageReset);
    localStorage.setItem(storageKey, JSON.stringify(filtersWithPageReset));
    setIsApplied(true);
    setIsApplyButtonDisabled(true);
    applyFilters(filtersWithPageReset);
  };

  const handleResetFilters = () => {
    setLocalFilters(initialFilters);
    setFilters(initialFilters);
    localStorage.removeItem(storageKey);
    setIsApplied(false);
    setIsModified(false);
    setIsApplyButtonDisabled(true);
    setIsResetButtonDisabled(true);
    applyFilters(initialFilters);
  };

  const applyFilters = (currentFilters) => {
    const queryString = new URLSearchParams(currentFilters).toString();
    const action = Role === 'client' 
      ? serverAsyncActions.getUserServers 
      : serverAsyncActions.getAllServers;
    dispatch(action({ requestData: `?${queryString}`, data: "" }));
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = {
      ...filters,
      page: newPage,
    };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const handleRowClick = (id) => {
    console.log("Row clicked:", id);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return <div className="container component"><Loader/></div>;
  }

  let errorMessage = error || '';
  if (!error && Servers?.length === 0) {
    errorMessage = "No servers found for the applied filters.";
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'pending':
        return 'pending';
      case 'unknown':
        return 'unknown';
      default:
        return '';
    }
  };

  return (
    <div className="container component">
      <div className="filters">
        <div className="date-filter">
          <label htmlFor="createdAt" className="filter-label">Created At</label>
          <input
            type="date"
            name="createdAt"
            value={localFilters.createdAt || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder="Select creation date"
          />
        </div>
        {Role === 'client' ? (
          <>
            <div className="text-filter">
              <label htmlFor="location" className="filter-label">Location</label>
              <input
                type="text"
                name="location"
                value={localFilters.location || ''}
                onChange={handleChange}
                className="filter-input"
                placeholder="Enter location"
              />
            </div>
            <div className="text-filter">
              <label htmlFor="serverName" className="filter-label">Server Name</label>
              <input
                type="text"
                name="serverName"
                value={localFilters.serverName || ''}
                onChange={handleChange}
                className="filter-input"
                placeholder="Enter server name"
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-filter">
              <label htmlFor="ipAddress" className="filter-label">IP Address</label>
              <input
                type="text"
                name="ipAddress"
                value={localFilters.ipAddress || ''}
                onChange={handleChange}
                className="filter-input"
                placeholder="Enter IP address"
              />
            </div>
            <div className="text-filter">
              <label htmlFor="username" className="filter-label">Username</label>
              <input
                type="text"
                name="username"
                value={localFilters.username || ''}
                onChange={handleChange}
                className="filter-input"
                placeholder="Enter username"
              />
            </div>
          </>
        )}
        <div className="text-filter">
          <label htmlFor="status" className="filter-label">Status</label>
          <select
            name="status"
            value={localFilters.status || ''}
            onChange={handleChange}
            className="filter-input"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="filter-buttons">
          <button
            onClick={handleApplyFilters}
            className="apply-filters-button"
            disabled={isApplyButtonDisabled}
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="reset-filters-button"
            disabled={isResetButtonDisabled}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {errorMessage ? (
        <ErrorCard message={errorMessage} isFullPage={false} />
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
                  <td>{server.agentCredentials?.sipIpAddress || 'N/A'}</td>
                  <td>
                    {server.dialerLocation?.city}, {server.dialerLocation?.country || 'N/A'}
                  </td>
                  <td>{server.companyUser?.firstName} {server.companyUser?.lastName}</td>
                  <td>{formatDate(server.createdAt)}</td>
                  <td className={`status ${getStatusClass(server.status)}`}>{server.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        {totalPages > 1 && (
          <>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AllServers;
