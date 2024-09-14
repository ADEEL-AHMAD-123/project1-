import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/LogsPage.scss'; // SCSS for logs page

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    level: '',
    startDate: '',
    endDate: '',
    ip: '',
  });
  const [pagination, setPagination] = useState({
    totalLogs: 0,
    totalPages: 1,
  });

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setFilters({ ...filters, page: 1 });
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      level: '',
      startDate: '',
      endDate: '',
      ip: '',
    });
    fetchLogs();
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  return (
    <div className="container logs-page">
      {/* Filters */}
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
            className="apply-filters-button"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="reset-filters-button"
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
