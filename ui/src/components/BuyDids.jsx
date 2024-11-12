import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import { cartAsyncActions } from '../redux/slices/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/ListingTable.scss';
import '../styles/FilterComponent.scss';
import ErrorCard from '../components/ErrorCard';
import Loader from '../components/Loader';

const BuyDIDs = () => {
  const dispatch = useDispatch();
  const { availableDIDs, isLoading, error, pagination = {} } = useSelector((state) => state.did);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [filters, setFilters] = useState(() => {
    const storedFilters = localStorage.getItem('didFilters');
    return storedFilters
      ? JSON.parse(storedFilters)
      : {
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
    const isUnchanged = JSON.stringify(filters) === JSON.stringify(appliedFilters);
    const isDefault =
      JSON.stringify(filters) ===
      JSON.stringify({
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

  useEffect(() => {
    localStorage.setItem('didFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (hasSearched || Object.values(appliedFilters).some(filter => filter)) {
      const queryParams = Object.entries(appliedFilters)
        .filter(([key, value]) => value && String(value).trim() !== '') // Ensure value is a string and not empty
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const queryString = queryParams ? `?${queryParams}` : '';
      dispatch(didAsyncActions.fetchAvailableDIDs({ requestData: queryString }));
    }
  }, [dispatch, appliedFilters, hasSearched]);

  useEffect(() => {
    const storedFilters = JSON.parse(localStorage.getItem('didFilters'));
    if (storedFilters && (storedFilters.country || storedFilters.state || storedFilters.areaCode || storedFilters.number)) {
      setFilters(storedFilters);
      setAppliedFilters(storedFilters);
      setHasSearched(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    // Reset the page to 1 before applying filters
    const updatedFilters = { ...filters, page: 1 }; // Explicitly set page to 1

    // Set the filters to state
    setFilters(updatedFilters);

    // Set the applied filters
    setAppliedFilters(updatedFilters);
    
    // Indicate that the user has searched
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
  };

  const toggleCartItem = (did) => {
    const isInCart = cartItems.some((item) => item._id === did._id);
    if (isInCart) {
      dispatch(cartAsyncActions.removeFromCart({ _id: did._id, type: did.type }));
    } else {
      dispatch(cartAsyncActions.addToCart({ ...did, type: did.type }));
    }
  };

  const isInCart = (did) => {
    return cartItems.some((item) => item._id === did._id);
  };

  if (isLoading) {
    return (
      <div className="container usage-summary">
        <Loader />
      </div>
    );
  }

  const totalPages = parseInt(pagination?.totalPages, 10) || 1;
  const currentPage = parseInt(pagination?.currentPage, 10) || 1;

  const handlePageChange = (newPage) => {
    const newPageNumber = parseInt(newPage, 10);
    if (newPageNumber < 1 || newPageNumber > totalPages) return;

    // Update filters to reflect the new page
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, page: newPageNumber };
      setAppliedFilters(updatedFilters); 
      return updatedFilters;
    });
  };

  return (
    <div className="container component">
      {error && <ErrorCard message={error} isFullPage={false} />}

      <div className="filters">
        <div className="text-filter">
          <input
            type="text"
            name="country"
            value={filters.country}
            onChange={handleChange}
            className="filter-input"
            placeholder="Country"
          />
        </div>
        <div className="text-filter">
          <input
            type="text"
            name="state"
            value={filters.state}
            onChange={handleChange}
            className="filter-input"
            placeholder="State"
          />
        </div>
        <div className="text-filter">
          <input
            type="text"
            name="areaCode"
            value={filters.areaCode}
            onChange={handleChange}
            className="filter-input"
            placeholder="Area Code"
          />
        </div>
        <div className="text-filter">
          <input
            type="text"
            name="number"
            value={filters.number}
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

      {hasSearched && availableDIDs.length === 0 && !error && (
        <ErrorCard message={"No DIDs available based on the applied filters."} isFullPage={false} />
      )}

      {hasSearched && availableDIDs.length > 0 && !error && (
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
              {availableDIDs.map((did) => (
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
              ))}
            </tbody>
          </table>
         {/* Pagination logic */}
      {!error && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage >= pagination.totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );
};

export default BuyDIDs;
