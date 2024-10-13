// src/components/MyDIDs.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { didAsyncActions } from "../redux/slices/didSlice"; 
import ErrorCard from "../components/ErrorCard";
import "../styles/MyDIDs.scss";

const MyDIDs = () => {
  const dispatch = useDispatch();

  // Access the DID state from Redux
  const { myDIDs, isLoading, error } = useSelector((state) => state.did);

  // Fetch the user's DIDs on component mount
  useEffect(() => {
    dispatch(didAsyncActions.fetchMyDIDs({ requestData: "" }));
  }, [dispatch]);

  // Handle loading state
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorCard 
        message={error}
        isFullPage={false} 
      />
    );
  }
  if (myDIDs.length== 0) {
    return (
      <ErrorCard 
        message={"you dont have any dids yet."}
        isFullPage={false} 
      />
    );
  }

  return (
    <div className="my-dids-container">
      <h2>My DIDs</h2>
      {myDIDs && myDIDs.length > 0 ? (
        <div className="did-list">
          {myDIDs.map((did, index) => (
            <div key={index} className="did-card">
              <div className="did-info">
                <h3>DID: {did.didNumber}</h3>
                <p><strong>Status:</strong> {did.status}</p>
                <p><strong>Country:</strong> {did.country}</p>
                <p><strong>State:</strong> {did.state}</p>
                <p><strong>Area Code:</strong> {did.areaCode}</p>
                <p><strong>Destination:</strong> {did.destination}</p>
                <p><strong>Caller ID Usage:</strong> {did.callerIdUsage ? 'Yes' : 'No'}</p>
                <p><strong>Created At:</strong> {new Date(did.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any DIDs yet.</p>
      )}
    </div>
  );
};

export default MyDIDs;
