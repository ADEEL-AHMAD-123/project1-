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
    <div className="logs-page">
      <h1>Logs</h1>
      <div className="filters">
        <input
          type="text"
          name="level"
          placeholder="Level"
          value={filters.level}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
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
        <p>Loading logs...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <div className="logs-table-container">
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
            {[...Array(pagination.totalPages).keys()].map((num) => (
              <button
                key={num}
                className={num + 1 === filters.page ? 'active' : ''}
                onClick={() => handlePageChange(num + 1)}
              >
                {num + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LogsPage;
