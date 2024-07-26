import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorCard.scss';

const ErrorCard = ({ message, buttonLabel, redirectLink }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (redirectLink) {
      navigate(redirectLink);
    }
  };

  return (
    <div className="error-section">
      <div className="error-card">
        <h2>{message}</h2>
        {buttonLabel && redirectLink && (
          <button onClick={handleRedirect} className='btn'>{buttonLabel}</button>
        )}
      </div>
    </div>
  );
};

export default ErrorCard;
