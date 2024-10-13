// src/components/AddDID.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './AddDID.scss';

const AddDIDs = () => {
  const [didNumber, setDidNumber] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    try {
      const response = await axios.post('/api/v1/dids', {
        didNumber,
        country,
        state,
        areaCode,
        destination,
      });

      setSuccessMessage(response.data.message);
      // Reset form fields
      setDidNumber('');
      setCountry('');
      setState('');
      setAreaCode('');
      setDestination('');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(['An unexpected error occurred. Please try again later.']);
      }
    }
  };

  return (
    <div className="add-did-container">
      <h2>Add New DID</h2>
      <form onSubmit={handleSubmit} className="add-did-form">
        <div className="form-group">
          <label htmlFor="didNumber">DID Number:</label>
          <input
            type="text"
            id="didNumber"
            value={didNumber}
            onChange={(e) => setDidNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State:</label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="areaCode">Area Code:</label>
          <input
            type="text"
            id="areaCode"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">Add DID</button>
      </form>

      {successMessage && <div className="success-message">{successMessage}</div>}

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              {error.didNumber ? (
                <>
                  <strong>DID:</strong> {error.didNumber} - {error.errors.join(', ')}
                </>
              ) : (
                error
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddDIDs;
