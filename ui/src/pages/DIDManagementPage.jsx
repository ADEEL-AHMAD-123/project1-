
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import '../styles/DIDManagementPage.scss'

const DIDManagementPage = () => {
  const dispatch = useDispatch();
  const { purchasedDIDs, isLoading, error } = useSelector((state) => state.did);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(didAsyncActions.fetchPurchasedDIDs());
  }, [dispatch]);

  const handleUpdateConfig = (didId, newConfig) => {
    dispatch(didAsyncActions.updateDIDConfig({ didId, newConfig }));
  };

  const handleScheduleDeletion = (didId, days) => {
    dispatch(didAsyncActions.scheduleDIDDeletion({ didId, days }));
  };

  const filteredDIDs = purchasedDIDs.filter((did) =>
    did.didNumber.includes(filter) || did.areaCode.includes(filter)
  );

  if (isLoading) return <p>Loading DIDs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="did-management">
      <h2>Manage Your DIDs</h2>
      <input
        type="text"
        placeholder="Filter by DID number or area code"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul className="did-list">
        {filteredDIDs.map((did) => (
          <li key={did._id} className="did-item">
            <div className="did-details">
              <span>{did.didNumber} ({did.country} - {did.areaCode})</span>
              <span>Status: {did.status}</span>
            </div>
            <div className="did-actions">
              <button onClick={() => handleUpdateConfig(did._id, 'new-config')}>Update Config</button>
              <button onClick={() => handleScheduleDeletion(did._id, 30)}>Schedule Deletion</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DIDManagementPage;
