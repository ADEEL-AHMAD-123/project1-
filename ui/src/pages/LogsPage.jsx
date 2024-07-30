import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/LogsPage.scss';

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

  useEffect(() => {
    fetchLogs();
  }, [filters.page]);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    setFilters({ ...filters, page: 1 });
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
      <h1 className="heading">Logs</h1>
      <div className="filters">
        <div className="date-filter">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Start Date"
          />
          <label htmlFor="startDate" className="placeholder">
            Start Date
          </label>
        </div>
        <div className="date-filter">
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="End Date"
          />
          <label htmlFor="endDate" className="placeholder">
            End Date
          </label>
        </div>
        <input
          type="text"
          name="level"
          placeholder="Level"
          value={filters.level}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="ip"
          placeholder="IP Address"
          value={filters.ip}
          onChange={handleFilterChange}
        />
        <button onClick={handleApplyFilters}>Apply Filters</button>
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
                    <td>{log.meta && log.meta.ip ? log.meta.ip : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            {filters.page > 1 && (
              <button className="pagination-button btn" onClick={() => handlePageChange(filters.page - 1)} >Previous</button>
            )}
            <span>Page {filters.page} of {pagination.totalPages}</span>
            {filters.page < pagination.totalPages && (
              <button className="pagination-button" onClick={() => handlePageChange(filters.page + 1)}>Next</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LogsPage;