import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import { orderAsyncActions } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import '../styles/DIDSelectionPage.scss'
const DIDSelectionPage = () => {
  const dispatch = useDispatch();
  const { availableDIDs, isLoading, error, totalPages, currentPage } = useSelector((state) => state.did);
  const [selectedDIDs, setSelectedDIDs] = useState([]);
  const [filter, setFilter] = useState({ country: '', areaCode: '' });

  useEffect(() => {
    dispatch(didAsyncActions.fetchAvailableDIDs({ ...filter, page: currentPage }));
  }, [dispatch, currentPage, filter]);

  const handleSelectDID = (didId) => {
    setSelectedDIDs((prevSelected) => [...prevSelected, didId]);
  };

  const handleCreateOrder = () => {
    if (selectedDIDs.length === 0) {
      toast.error('No DIDs selected');
      return;
    }
    dispatch(orderAsyncActions.createOrder(selectedDIDs));
  };

  const handlePageChange = (pageNumber) => {
    dispatch(didAsyncActions.fetchAvailableDIDs({ ...filter, page: pageNumber }));
  };

  return (
    <div className="did-selection">
      <h2>Select Available DIDs</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by Country"
          value={filter.country}
          onChange={(e) => setFilter({ ...filter, country: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Area Code"
          value={filter.areaCode}
          onChange={(e) => setFilter({ ...filter, areaCode: e.target.value })}
        />
      </div>
      {isLoading && <p>Loading DIDs...</p>}
      {error && <p>{error}</p>}
      <ul className="did-list">
        {availableDIDs.map((did) => (
          <li key={did._id} className="did-item">
            <span>{did.didNumber} ({did.country} - {did.areaCode})</span>
            <button onClick={() => handleSelectDID(did._id)}>Select</button>
          </li>
        ))}
      </ul>
      <button className="create-order" onClick={handleCreateOrder}>Create Order</button>

      <div className="pagination-controls">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
};

export default DIDSelectionPage;
