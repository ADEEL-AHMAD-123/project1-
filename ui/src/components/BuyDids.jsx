import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import { cartAsyncActions } from '../redux/slices/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';

const BuyDIDs = () => {
  const dispatch = useDispatch();
  const { availableDIDs, isLoading, error, pagination = {} } = useSelector((state) => state.did);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [filters, setFilters] = useState(() => {
    const storedFilters = localStorage.getItem('didFilters');
    return storedFilters ? JSON.parse(storedFilters) : {
      country: '',
      state: '',
      areaCode: '',
      number: '',
      page: 1,
      limit: 10,
    };
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    localStorage.setItem('didFilters', JSON.stringify(filters));
    // Whenever filters change, reset the page to 1
    setFilters((prevFilters) => ({ ...prevFilters, page: 1 }));
  }, [filters]);

  useEffect(() => {
    const isUnchanged = JSON.stringify(filters) === JSON.stringify(appliedFilters);
    const isDefault = JSON.stringify(filters) === JSON.stringify({
      country: '',
      state: '',
      areaCode: '',
      number: '',
      page: 1,
      limit: 10,
    });

    setIsApplyButtonDisabled(isUnchanged || isDefault);
    setIsResetButtonDisabled(isDefault);
  }, [filters, appliedFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
    
    // Fetch data with updated filters immediately
    const queryString = new URLSearchParams({ ...filters, page: newPage }).toString();
    dispatch(didAsyncActions.fetchAvailableDIDs({ requestData: `?${queryString}` }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    const queryString = new URLSearchParams(filters).toString();
    dispatch(didAsyncActions.fetchAvailableDIDs({ requestData: `?${queryString}` }));
    setHasSearched(true);
  };

  const resetFilters = () => {
    const defaultFilters = {
      country: '',
      state: '',
      areaCode: '',
      number: '',
      page: 1,
      limit: 10,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setHasSearched(false);
    dispatch(didAsyncActions.fetchAvailableDIDs({ requestData: '' }));
  };

  const toggleCartItem = (did) => {
    const isInCart = cartItems.some(item => item._id === did._id);
    
    if (isInCart) {
      dispatch(cartAsyncActions.removeFromCart({ _id: did._id, type: did.type }));
    } else {
      dispatch(cartAsyncActions.addToCart({ ...did, type: did.type }));
    }
  };

  const isInCart = (did) => {
    return cartItems.some(item => item._id === did._id);
  };

  if (isLoading) {
    return <div className="container usage-summary"><h1 className="message">Loading...</h1></div>;
  }

 

  const totalPages = pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="container component">
      {/* Filters */}
      <div className="filters">
        <div className="text-filter">
          <input
            type="text"
            name="country"
            value={filters.country || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder="Country"
          />
        </div>
        <div className="text-filter">
          <input
            type="text"
            name="state"
            value={filters.state || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder="State"
          />
        </div>
        <div className="text-filter">
          <input
            type="text"
            name="areaCode"
            value={filters.areaCode || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder="Area Code"
          />
        </div>
        <div className="text-filter">
          <input
            type="text"
            name="number"
            value={filters.number || ''}
            onChange={handleChange}
            className="filter-input"
            placeholder="DID Number"
          />
        </div>
        <div className="filter-buttons">
          <button
            onClick={applyFilters}
            className="apply-filters-button"
            disabled={isApplyButtonDisabled}
          >
            Search DIDs
          </button>
          <button
            onClick={resetFilters}
            className="reset-filters-button"
            disabled={isResetButtonDisabled}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      {hasSearched && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Country</th>
                <th>State</th>
                <th>Area Code</th>
                <th>Destination</th>
                <th>Caller ID Usage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableDIDs.length ? (
                availableDIDs.map((did) => (
                  <tr key={did._id}>
                    <td>{did.didNumber}</td>
                    <td>{did.country}</td>
                    <td>{did.state}</td>
                    <td>{did.areaCode}</td>
                    <td>{did.destination || 'N/A'}</td>
                    <td>{did.callerIdUsage || 'N/A'}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={isInCart(did) ? faTrashAlt : faCartPlus}
                        className={isInCart(did) ? 'cart-remove-icon' : 'cart-add-icon'}
                        onClick={() => toggleCartItem(did)} 
                        style={{ cursor: 'pointer', fontSize: '18px' }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No DIDs available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {hasSearched && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="pagination-button">Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Next</button>
        </div>
      )}
    </div>
  );
};

export default BuyDIDs;
