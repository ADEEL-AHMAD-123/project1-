import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { billingAsyncActions } from '../redux/slices/billingSlice';
import ErrorCard from './ErrorCard';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';

const InboundUsage = () => {
  const dispatch = useDispatch();
  const { loading, error, InBoundUsage, BillingAccount, pagination = {} } = useSelector((state) => state.billing);
  const { Role, hasBillingAccount } = useSelector((state) => state.user);

  const initialFilters = {
    id_user: Role === 'client' ? BillingAccount?.id || '' : '',
    period: 'daily',
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    type: 'inbound',
  };

  const storageKey = 'inboundUsageFilters';
  const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem(storageKey)) || initialFilters);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isModified, setIsModified] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const isFilterModified = JSON.stringify(localFilters) !== JSON.stringify(filters);
    setIsModified(isFilterModified);
  }, [localFilters, filters]);

  useEffect(() => {
    if (Role === 'client' && hasBillingAccount && !BillingAccount?.id) {
      dispatch(billingAsyncActions.getBillingAccount({ requestData: '' }));
    }
  }, [Role, hasBillingAccount, BillingAccount?.id, dispatch]);

  useEffect(() => {
    if (Role !== 'client' || (Role === 'client' && BillingAccount?.id)) {
      applyFilters(filters);
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
    applyFilters(localFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters(initialFilters);
    setFilters(initialFilters);
    localStorage.removeItem(storageKey);
    setIsApplied(false);
    applyFilters(initialFilters);
  };

  const applyFilters = (currentFilters) => {
    if (Role === 'client' && !BillingAccount?.id) return;

    const updatedFilters = Role === 'client'
      ? { ...currentFilters, id_user: BillingAccount?.id, role: Role }
      : { ...currentFilters, role: Role };

    const queryString = new URLSearchParams(updatedFilters).toString();
    dispatch(billingAsyncActions.getInboundUsage({ requestData: `?${queryString}` }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  if (loading) {
    return <div className="container usage-summary"><h1 className="message">Loading...</h1></div>;
  }

  if (Role === 'client' && !hasBillingAccount) {
    return (
      <ErrorCard 
        message="No billing account created yet." 
        buttonLabel="Create Billing Account"
        redirectLink="/" 
        isFullPage={false}
      />
    );
  }

  let errorMessage = error || '';
  if (!error && InBoundUsage?.length === 0) {
    errorMessage = isApplied ? "No data found for the applied filters." : "No Inbound Usage data available.";
  }

  const currentPage = filters.page;

  return (
    <div className="container component">
      <div className="filters">
        <div className="date-filter">
          <label htmlFor="startDate" className="filter-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={localFilters.startDate || ''}
            onChange={handleChange}
            className="filter-input"
            max={today}
            placeholder="Select start date"
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
            max={today}
            placeholder="Select end date"
          />
        </div>
        {Role !== 'client' && (
          <div className="text-filter">
            <label htmlFor="id_user" className="filter-label">User ID</label>
            <input
              type="text"
              name="id_user"
              value={localFilters.id_user || ''}
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
          <button
            onClick={handleApplyFilters}
            className="apply-filters-button"
            disabled={!isModified}
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="reset-filters-button"
            disabled={!isModified && !isApplied}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {errorMessage ? (
        <ErrorCard 
          message={errorMessage} 
          isFullPage={false}
        />
      ) : (
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
                {Role !== 'client' && <th>Buy Price</th>}
                <th>Sell Price</th>
                <th>Markup</th>
                <th>ASR</th>
              </tr>
            </thead>
            <tbody>
              {InBoundUsage.map((data) => (
                <tr key={data._id}>
                  <td>{data.day}</td>
                  <td>{data.idUserusername}</td>
                  <td>{data.sessiontime}</td>
                  <td>{data.aloc_all_calls}</td>
                  <td>{data.nbcall}</td>
                  <td>{data.nbcall - data.nbcall_fail}</td>
                  <td>{data.nbcall_fail}</td>
                  {Role !== 'client' && <td>{data.sumbuycost}</td>}
                  <td>{data.sellPrice}</td>
                  <td>{data.markup}</td>
                  <td>{data.asr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination?.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {pagination.totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default InboundUsage;
