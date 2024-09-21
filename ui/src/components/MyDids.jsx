// src/components/MyDIDs.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { didAsyncActions } from "../redux/slices/didSlice"; 
import ErrorCard from "../components/ErrorCard";
import "../styles/MyDIDs.scss"

const MyDIDs = () => {
  const dispatch = useDispatch();

  // Access the DID state from Redux
  const { myDIDs, isLoading, error } = useSelector((state) => state.did);

  // Fetch the user's DIDs on component mount
  useEffect(() => {
    dispatch(didAsyncActions.fetchMyDIDs({requestData:""}));
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

  return (
    <div className="my-dids-container">
      <h2>My DIDs</h2>
      {myDIDs && myDIDs.length > 0 ? (
        <ul className="did-list">
          {myDIDs.map((did, index) => (
            <li key={index} className="did-item">
              <span>DID: {did.did}</span> {/* Adjust field name based on your API */}
              <span>Status: {did.status}</span> {/* Adjust field name based on your API */}
              {/* Add more fields as needed */}
            </li>
          ))}
        </ul>
      ) : (
        <p>You don't have any DIDs yet.</p>
      )}
    </div>
  );
};

export default MyDIDs;
