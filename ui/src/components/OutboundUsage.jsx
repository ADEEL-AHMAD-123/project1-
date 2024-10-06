import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { billingAsyncActions } from '../redux/slices/billingSlice';
import ErrorCard from './ErrorCard';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';

const OutBoundUsage = () => {
  const dispatch = useDispatch();
  const { loading, error, OutBoundUsage, BillingAccount, pagination = {} } = useSelector((state) => state.billing);
  const { Role, hasBillingAccount } = useSelector((state) => state.user);

  const initialFilters = {
    id: Role === 'client' ? BillingAccount?.id || '' : '',
    period: 'daily',
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    type: 'outbound',
  };

  const storageKey = 'outboundUsageFilters';
  const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem(storageKey)) || initialFilters);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isModified, setIsModified] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const isFilterModified = JSON.stringify(localFilters) !== JSON.stringify(filters);
    setIsModified(isFilterModified);

    setIsApplyButtonDisabled(!isFilterModified);
    setIsResetButtonDisabled(!isApplied && JSON.stringify(localFilters) === JSON.stringify(initialFilters));
  }, [localFilters, filters, isApplied]);

  useEffect(() => {
    // Dispatch getBillingAccount if Role is 'client' and they don't have BillingAccount yet
    if (Role === 'client' && hasBillingAccount && !BillingAccount?.id) {
      dispatch(billingAsyncActions.getBillingAccount({ requestData: '' }));
    }
  }, [Role, hasBillingAccount, BillingAccount?.id, dispatch]);

  useEffect(() => {
    // Apply filters when page loads for all roles
    // For clients, wait for BillingAccount.id to be available before dispatching
    if (Role !== 'client' || (Role === 'client' && BillingAccount?.id)) {
      applyFilters(filters); // Apply filters on page load
    }
  }, [Role, BillingAccount?.id, filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    localStorage.setItem(storageKey, JSON.stringify(localFilters));
    setIsApplied(true);
    setIsApplyButtonDisabled(true);
    applyFilters(localFilters);
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
    // Prevent dispatching if it's a client and BillingAccount.id isn't available
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

  // Check for conditions to render messages
  if (loading) {
    return <div className="container inbound-usage"><h1 className="message">Loading...</h1></div>;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

 

  const totalPages = pagination?.totalPages || 1;
  const currentPage = localFilters.page || 1;

  return (
    <div className="container component">
      <div className="filters">
        <div className="date-filter">
          <label htmlFor="startDate" className="filter-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ''}
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
            value={filters.endDate || ''}
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
              value={filters.id || ''}
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
            value={filters.period || 'daily'}
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
            disabled={isResetButtonDisabled}
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
                <td colSpan="11" className="no-data">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && ( // Render pagination only if there is more than one page
        <div className="pagination">
          {currentPage > 1 && ( // Render "Previous" button if not on the first page
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="pagination-button"
            >
              Previous
            </button>
          )}
          <span>Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && ( // Render "Next" button if not on the last page
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
