// UsageTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorCard from './ErrorCard';
import Loader from './Loader';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';

const UsageTable = ({ usageType, fetchAction }) => {
  const dispatch = useDispatch();
  const { isLoading, error, BillingAccount, pagination = {} } = useSelector((state) => state.billing);
  const { Role, hasBillingAccount } = useSelector((state) => state.user);
  const usageData = useSelector((state) => state.billing[usageType]); // dynamic data based on usageType

  const initialFilters = {
    id_user: Role === 'client' ? BillingAccount?.id || '' : '',
    period: 'daily',
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    type: usageType,
  };

  const storageKey = `${usageType}Filters`;
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
      dispatch(fetchAction.getBillingAccount({ requestData: '' }));
    }
  }, [Role, hasBillingAccount, BillingAccount?.id, dispatch, fetchAction]);

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
    dispatch(fetchAction.getUsageData({ requestData: `?${queryString}` }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  if (isLoading) return <div className="container usage-summary"><Loader /></div>;

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
  if (!error && usageData?.length === 0) {
    errorMessage = isApplied ? "No data found for the applied filters." : `No ${usageType} Usage data available.`;
  }

  return (
    <div className="container component">
      {/* Filter Section */}
      <div className="filters">
        {/* Filter Fields (date, period, etc.) */}
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
        {/* More filters */}
        {/* Apply and Reset Buttons */}
      </div>

      {/* Table or Error Message */}
      {errorMessage ? (
        <ErrorCard message={errorMessage} isFullPage={false} />
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
              {usageData.map((data) => (
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

      {/* Pagination */}
      <div className="pagination">
        {filters.page > 1 && (
          <button className="pagination-button" onClick={() => handlePageChange(filters.page - 1)}>
            Previous
          </button>
        )}
        <span>Page {filters.page} of {pagination.totalPages}</span>
        {filters.page < pagination.totalPages && (
          <button className="pagination-button" onClick={() => handlePageChange(filters.page + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default UsageTable;
