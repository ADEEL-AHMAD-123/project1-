import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorCard.scss';

const ErrorCard = ({ message, buttonLabel, redirectLink, isFullPage = true }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (redirectLink) {
      navigate(redirectLink);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={isFullPage ? "error-section" : "error-card-container"}>
      <div className="error-card">
        <h2>{message}</h2>
        {buttonLabel && (
          <button onClick={handleRedirect} className="btn">
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorCard;
