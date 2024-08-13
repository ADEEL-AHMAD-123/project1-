import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { billingAsyncActions } from '../redux/slices/billingSlice'; 
import ErrorCard from './ErrorCard';
import '../styles/ListingTable.scss'; 
import '../styles/FilterComponent.scss'; 

const InboundUsage = () => {
  const dispatch = useDispatch();
  const { InBoundUsage = [], loading, error, pagination = {}, account = {} } = useSelector((state) => state.billing);
  const { Role } = useSelector((state) => state.user);

  const [filters, setFilters] = useState({
    id: account.id || '', // Default to empty string if account.id is undefined
    period: 'daily', // Default period
    page: 1,
    limit: 10,
    startDate: '', 
    endDate: '',
    username: '',
    type: 'inbound', // Add type filter here
  });

  useEffect(() => {
    // Fetch initial data with default filters when component mounts
    applyFilters();
  }, []);

  useEffect(() => {
    // Fetch data whenever filters change
    applyFilters();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  const applyFilters = () => {
    // Add type to filters
    const updatedFilters = { ...filters, type: 'inbound' };
    const queryString = new URLSearchParams(updatedFilters).toString();
    console.log('Applying filters with query:', queryString); // Debugging line
    dispatch(billingAsyncActions.getInboundUsage({ requestData: `?${queryString}` }));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDate(filters.startDate);
  const formattedEndDate = formatDate(filters.endDate);

  if (loading) {
    return <div className="container usage-summary"><h1 className="message">Loading...</h1></div>;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  // Ensure pagination has valid values
  const totalPages = pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="container usage-summary">
      <div className="filters">
        <div className="date-filter">
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
            className="filter-input"
          />
          <label htmlFor="startDate" className="placeholder">
            Start Date
          </label>
        </div>
        <div className="date-filter">
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ''}
            onChange={handleChange}
            className="filter-input"
          />
          <label htmlFor="endDate" className="placeholder">
            End Date
          </label>
        </div>
    
        {Role !== 'client' && (
          <div className="text-filter">
            <input
              type="text"
              name="id"
              value={filters.id || ''}
              onChange={handleChange}
              className="filter-input"
              placeholder='User ID'
            />
          </div>
        )}
        <div className="select-container">
          <select
            name="period"
            value={filters.period || 'daily'}
            onChange={handleChange}
            className="select-field"
          >
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <button onClick={applyFilters} className="apply-filters-button">Apply Filters</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Username</th>
              <th>Duration/Min</th>
              <th>ALOC</th>
              <th>All Calls</th>
              <th>Answered</th>
              <th>Failed</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Markup</th>
              <th>ASR</th>
            </tr>
          </thead>
          <tbody>
            {InBoundUsage.length ? (
              InBoundUsage.map((data) => (
                <tr key={data._id}>
                  <td>{data.day}</td>
                  <td>{data.username}</td>
                  <td>{data.sessiontime}</td>
                  <td>{data.aloc_all_calls}</td>
                  <td>{data.nbcall}</td>
                  <td>{data.nbcall - data.nbcall_fail}</td>
                  <td>{data.nbcall_fail}</td>
                  <td>{data.sumbuycost}</td>
                  <td>{data.sellPrice}</td>
                  <td>{data.markup}</td>
                  <td>{data.asr}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage <= 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InboundUsage;
