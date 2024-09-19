import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initial filter state
  const initialFilters = {
    page: 1,
    limit: 10,
    level: '',
    startDate: '',
    endDate: '',
    ip: '',
  };

  // Fetch saved filters from localStorage or use initial filters
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('logs-filters');
    return savedFilters ? JSON.parse(savedFilters) : initialFilters;
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    totalLogs: 0,
    totalPages: 1,
  });
  
  // Button states, persisted in localStorage
  const [isApplyActive, setIsApplyActive] = useState(() => {
    return localStorage.getItem('isApplyActive') === 'true';
  });
  
  const [isResetActive, setIsResetActive] = useState(() => {
    return localStorage.getItem('isResetActive') === 'true';
  });

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch logs whenever filters change
  useEffect(() => {
    fetchLogs();
  }, [filters.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/log`, {
        params: filters,
        withCredentials: true,
      });
      setLogs(response.data.logs);
      setPagination({
        totalLogs: response.data.totalLogs,
        totalPages: response.data.totalPages,
      });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching logs');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    const updatedFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(updatedFilters);

    // Enable the "Apply Filters" button when any field is modified
    setIsApplyActive(true);

    // Persist changes in localStorage
    localStorage.setItem('logs-filters', JSON.stringify(updatedFilters));
    localStorage.setItem('isApplyActive', 'true');
  };

  const handleApplyFilters = () => {
    setFilters({ ...filters, page: 1 });
    fetchLogs();

    // After applying filters, enable the "Reset Filters" button and disable "Apply Filters"
    setIsApplyActive(false);
    setIsResetActive(true);

    // Persist button states
    localStorage.setItem('isApplyActive', 'false');
    localStorage.setItem('isResetActive', 'true');
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    fetchLogs();

    // After resetting filters, disable both buttons
    setIsApplyActive(false);
    setIsResetActive(false);

    // Clear localStorage
    localStorage.removeItem('logs-filters');
    localStorage.setItem('isApplyActive', 'false');
    localStorage.setItem('isResetActive', 'false');
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  // Get today's date for the date inputs
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  };

  return (
    <div className="container component">
      {/* Filters Section */}
      <div className="filters">
        <div className="date-filter">
          <label htmlFor="startDate" className="filter-label">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="filter-input"
            max={getTodayDate()}  // Restrict to today's date
          />
        </div>
        <div className="date-filter">
          <label htmlFor="endDate" className="filter-label">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="filter-input"
            max={getTodayDate()}  // Restrict to today's date
          />
        </div>
        <div className="text-filter">
          <label htmlFor="level" className="filter-label">
            Log Level
          </label>
          <input
            type="text"
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="filter-input"
            placeholder="Log Level (e.g., info, error)"
          />
        </div>
        <div className="text-filter">
          <label htmlFor="ip" className="filter-label">
            IP Address
          </label>
          <input
            type="text"
            name="ip"
            value={filters.ip}
            onChange={handleFilterChange}
            className="filter-input"
            placeholder="IP Address"
          />
        </div>

        {/* Filter buttons */}
        <div className="filter-buttons">
          <button
            onClick={handleApplyFilters}
            className={`apply-filters-button ${isApplyActive ? 'active' : 'disabled'}`}
            disabled={!isApplyActive}  // Disabled until changes are made
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className={`reset-filters-button ${isResetActive ? 'active' : 'disabled'}`}
            disabled={!isResetActive}  // Disabled until filters are applied
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading logs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div className="table-container logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Message</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.level}</td>
                    <td>{log.message}</td>
                    <td>{log.meta?.ip || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            {filters.page > 1 && (
              <button
                className="pagination-button"
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </button>
            )}
            <span>Page {filters.page} of {pagination.totalPages}</span>
            {filters.page < pagination.totalPages && (
              <button
                className="pagination-button"
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LogsPage;
