// src/components/dids/BuyDIDs.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import { cartAsyncActions } from '../redux/slices/cartSlice'; // Import the cart actions

const BuyDIDs = () => {
  const dispatch = useDispatch();
  const { availableDIDs, isLoading, error, pagination = {} } = useSelector((state) => state.did);
  const { items: cartItems } = useSelector((state) => state.cart); // Get cart items from Redux

  const [filters, setFilters] = useState({
    country: '',
    state: '',
    areaCode: '',
    number: '',
    page: 1,
    limit: 10,
  });

  const [appliedFilters, setAppliedFilters] = useState(filters); // Track applied filters
  const [isApplyButtonDisabled, setIsApplyButtonDisabled] = useState(true); // Track if button should be disabled
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true); // Track if reset button should be disabled

  useEffect(() => {
    applyFilters(); // Fetch DIDs with default filters on mount
  }, []);

  useEffect(() => {
    // Enable the "Apply Filters" and "Reset Filters" buttons based on changes in filters
    const isUnchanged = JSON.stringify(filters) === JSON.stringify(appliedFilters);
    const isDefault = JSON.stringify(filters) === JSON.stringify({
      country: '',
      state: '',
      areaCode: '',
      number: '',
      page: 1,
      limit: 10,
    });

    setIsApplyButtonDisabled(isUnchanged || isDefault); // Disable if unchanged or no filters applied
    setIsResetButtonDisabled(isDefault); // Disable if no filters applied
  }, [filters, appliedFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters); // Update applied filters
    const queryString = new URLSearchParams(filters).toString();
    dispatch(didAsyncActions.fetchAvailableDIDs({ requestData: `?${queryString}` }));
  };

  const resetFilters = () => {
    // Reset filters to default state
    const defaultFilters = {
      country: '',
      state: '',
      areaCode: '',
      number: '',
      page: 1,
      limit: 10,
    };
    setFilters(defaultFilters); // Reset filters state

    // Immediately fetch DIDs without any filters
    setAppliedFilters(defaultFilters); // Ensure applied filters are updated
    dispatch(didAsyncActions.fetchAvailableDIDs({ requestData: '' })); // Fetch DIDs without filters
  };

  const handleAddToCart = (did) => {
    // Check if DID is already in cart
    const isInCart = cartItems.some(item => item._id === did._id);
    
    if (isInCart) {
      // Remove from cart
      dispatch(cartAsyncActions.removeFromCart(did._id));
    } else {
      // Add to cart
      dispatch(cartAsyncActions.addToCart(did));
    }
  };

  const isInCart = (did) => {
    return cartItems.some(item => item._id === did._id); // Check if the DID is in the cart
  };

  if (isLoading) {
    return <div className="container usage-summary"><h1 className="message">Loading...</h1></div>;
  }

  if (error) {
    return <div className="container usage-summary"><h1 className="message">{error}</h1></div>;
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="container usage-summary">
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
            Apply Filters
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
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(did)}
                    >
                      {isInCart(did) ? 'Remove from Cart' : 'Add to Cart'}
                    </button>
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

      {/* Pagination */}
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

export default BuyDIDs;
