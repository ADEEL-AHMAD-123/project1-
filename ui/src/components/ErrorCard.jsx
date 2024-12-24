import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ErrorCard.scss";

const ErrorCard = ({
  message,
  buttonLabel,
  redirectLink,
  isFullPage = true,
  showOkButton = false,
  onClose,
  isCard = true, // New prop to toggle card style
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleRedirect = () => {
    if (redirectLink) {
      navigate(redirectLink);
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const buttonCount = (buttonLabel ? 1 : 0) + (showOkButton ? 1 : 0);
  const buttonClass =
    buttonCount === 1
      ? "single"
      : buttonCount === 2
      ? "two"
      : buttonCount > 2
      ? "multiple"
      : "";

  return (
    <div className={isFullPage ? "error-section" : "error-card-container"}>
      <div className={`error-card ${isCard ? "card-style" : ""}`}>
        <h2>{message}</h2>
        <div className={`buttons ${buttonClass}`}>
          {buttonLabel && (
            <button onClick={handleRedirect} className="btn">
              {buttonLabel}
            </button>
          )}
          {showOkButton && (
            <button onClick={handleClose} className="btn">
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
