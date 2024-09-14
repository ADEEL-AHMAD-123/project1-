import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { billingAsyncActions } from '../redux/slices/billingSlice';
import ErrorCard from './ErrorCard';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';

const OutBoundUsage = () => {
  const dispatch = useDispatch();
  const { loading, error, OutBoundUsage, pagination = {} } = useSelector((state) => state.billing);
  const { Role, BillingAccount } = useSelector((state) => state.user);

  const initialFilters = {
    id: Role === 'client' ? BillingAccount?.id || '' : '',
    period: 'daily',
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    type: 'outbound'
  };

  // Unique key for storing filter data specific to OutBoundUsage
  const storageKey = 'outboundUsageFilters';

  // Load filters from localStorage or use the initial ones
  const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem(storageKey)) || initialFilters);
  const [localFilters, setLocalFilters] = useState(filters);

  // Track if filters have been modified
  const [isModified, setIsModified] = useState(false);

  // Track if filters are applied
  const [isApplied, setIsApplied] = useState(false);

  // Button states
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Effect to check for changes in filters and handle button enabling/disabling
  useEffect(() => {
    const isFilterModified = JSON.stringify(localFilters) !== JSON.stringify(filters);
    setIsModified(isFilterModified);

    if (isFilterModified) {
      setIsApplyButtonDisabled(false);  // Enable the "Apply Filters" button when changes are detected
    } else {
      setIsApplyButtonDisabled(true);   // Disable if no changes
    }

    // Enable "Reset Filters" if local filters are different from the initial state or applied filters
    setIsResetButtonDisabled(!isApplied && JSON.stringify(localFilters) === JSON.stringify(initialFilters));
  }, [localFilters, filters, isApplied]);

  useEffect(() => {
    if (Role === 'client' && !BillingAccount?.id) return;
    applyFilters(filters);
    setIsApplied(true);
    setIsResetButtonDisabled(false); // Enable reset if filters are applied
  }, [Role, BillingAccount?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters); // Update filters state
    localStorage.setItem(storageKey, JSON.stringify(localFilters));
    setIsApplied(true);
    setIsApplyButtonDisabled(true);  // Disable the button after applying filters

    // Fetch data with the updated filters
    applyFilters(localFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters(initialFilters);
    setFilters(initialFilters);
    localStorage.removeItem(storageKey);
    setIsApplied(false);
    setIsModified(false);
    setIsApplyButtonDisabled(true); // Disable apply button after reset
    setIsResetButtonDisabled(true); // Disable reset button after reset
    applyFilters(initialFilters);
  };

  const applyFilters = (currentFilters) => {
    if (Role === 'client' && !BillingAccount?.id) return;

    const updatedFilters = Role === 'client'
      ? { ...currentFilters, id: BillingAccount?.id }
      : currentFilters;

    const queryString = new URLSearchParams(updatedFilters).toString();
    dispatch(billingAsyncActions.getOutboundUsage({ requestData: `?${queryString}` }));
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = {
      ...localFilters,
      page: newPage,
    };
    setLocalFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  if (loading) {
    return <div className="container outbound-usage"><h1 className="message">Loading...</h1></div>;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  if (Role === 'client' && !BillingAccount?.id) {
    return <div className="container outbound-usage"><h1 className="message">No billing account found.</h1></div>;
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = localFilters.page || 1;

  return (
    <div className="container usage-summary">
      <div className="filters">
        <div className="date-filter">
          <label htmlFor="startDate" className="filter-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={localFilters.startDate || ''}
            onChange={handleChange}
            className="filter-input"
            max={today} // Restrict date to today's date
            placeholder="Select start date" // Placeholder for date input
          />
        </div>
        <div className="date-filter">
          <label htmlFor="endDate" className="filter-label">End Date</label>
          <input
            type="date"
            name="endDate"
            value={localFilters.endDate || ''}
            onChange={handleChange}
            className="filter-input"
            max={today} // Restrict date to today's date
            placeholder="Select end date" // Placeholder for date input
          />
        </div>
        {Role !== 'client' && (
          <div className="text-filter">
            <label htmlFor="id" className="filter-label">User ID</label>
            <input
              type="text"
              name="id"
              value={localFilters.id || ''}
              onChange={handleChange}
              className="filter-input"
              placeholder="Enter user ID"
            />
          </div>
        )}
       
        <div className="select-container">
          <label htmlFor="period" className="filter-label">Period</label>
          <select
            name="period"
            value={localFilters.period || 'daily'}
            onChange={handleChange}
            className="select-field"
          >
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div className="filter-buttons">
          {/* Enable "Apply Filters" button only if filters are modified */}
          <button
            onClick={handleApplyFilters}
            className="apply-filters-button"
            disabled={isApplyButtonDisabled}
          >
            Apply Filters
          </button>
          {/* Enable "Reset Filters" button only if filters have been applied */}
          <button
            onClick={handleResetFilters}
            className="reset-filters-button"
            disabled={isResetButtonDisabled} // Only enabled if filters were applied
          >
            Reset Filters
          </button>
        </div>
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
            {OutBoundUsage.length ? (
              OutBoundUsage.map((data) => (
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
                <td colSpan="11">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="pagination-button"
            >
              Previous
            </button>
          )}
          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="pagination-button"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OutBoundUsage;
