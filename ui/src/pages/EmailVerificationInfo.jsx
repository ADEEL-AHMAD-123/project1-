import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  userAsyncActions,
  storeUnverifiedEmail,
  clearError,
} from "../redux/slices/userSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import ErrorCard from "../components/ErrorCard";
import "../styles/EmailVerificationInfo.scss";

const EmailVerificationInfo = () => {
  const dispatch = useDispatch();
  const { isLoading, unverifiedEmail, error, isEmailVerified } = useSelector(
    (state) => state.user
  );
  const [isCooldown, setCooldown] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(60); // Cooldown time in seconds
  const [localEmail, setLocalEmail] = useState(unverifiedEmail || ""); // Local state for input
  const location = useLocation();
  const navigate = useNavigate();

  const [isStateLoaded, setIsStateLoaded] = useState(false); // Track if the state is loaded
  const [fromLoginOrRegister, setFromLoginOrRegister] = useState(false);

  // Retrieve cooldown state from localStorage on component mount
  useEffect(() => {
    const savedCooldownState = JSON.parse(localStorage.getItem("cooldownState"));

    if (savedCooldownState) {
      setCooldown(savedCooldownState.isCooldown);
      setCooldownTimeLeft(savedCooldownState.cooldownTimeLeft);
    }

    if (location.state?.fromLogin || location.state?.fromRegister) {
      setFromLoginOrRegister(true);
    }
    setIsStateLoaded(true); // Mark state as loaded
  }, [location.state]);

  useEffect(() => {
    if (isCooldown) {
      const interval = setInterval(() => {
        setCooldownTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setCooldown(false);
            localStorage.removeItem("cooldownState"); // Clear cooldown state from localStorage
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Save cooldown state to localStorage
      localStorage.setItem(
        "cooldownState",
        JSON.stringify({ isCooldown, cooldownTimeLeft })
      );

      return () => clearInterval(interval);
    }
  }, [isCooldown, cooldownTimeLeft]);

  const handleResendVerification = async () => {
    if (!localEmail) {
      toast.error("Email is required to resend verification!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localEmail)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    const resultAction = await dispatch(
      userAsyncActions.resendVerificationEmail({ data: { email: localEmail } })
    );

    // Check if the action was fulfilled or if a rate limit error occurred
    if (userAsyncActions.resendVerificationEmail.fulfilled.match(resultAction)) {
      dispatch(storeUnverifiedEmail(localEmail));
      setCooldown(true);
      setCooldownTimeLeft(5); // Default cooldown time (in case of success)
    } else if (resultAction.payload?.statusCode === 429) {
      // Handle rate limit exceeded error
      toast.error(resultAction.payload.message);
      setCooldown(true);
      setCooldownTimeLeft(resultAction.payload.remainingTime || 60); // Set cooldown time based on the remaining time from the backend
    } else {
      // Handle other errors (e.g., email already verified)
      toast.error(
        resultAction.payload?.message ||
        "Something went wrong while resending the verification email."
      );
    }
  };

  // Show loader while state is loading
  if (!isStateLoaded) {
    return <Loader />;
  }

  if (!fromLoginOrRegister) {
    return (
      <ErrorCard
        message="Access Denied. You cannot access this page directly."
        buttonLabel="Go Back"
      />
    );
  }

  // Check if the email is already verified or if there's an error related to email verification
  if (isEmailVerified || (error && error.message === "Email is already verified")) {
    return (
      <ErrorCard
        message="Your email is already verified."
        buttonLabel="Go to Dashboard"
        redirectLink="/" // Optional: Redirect to the dashboard page
      />
    );
  }

 

  if (!unverifiedEmail) {
    return (
      <ErrorCard
        message="No email found to verify."
        buttonLabel="Login"
        redirectLink="/login"
      />
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  const maskedEmail = unverifiedEmail
    ? unverifiedEmail.replace(/(.{2}).+(@.+)/, "$1***$2")
    : "your email";

  return (
    <div className="auth-page email-info-page">
      <div className="content-wrapper">
        <h1>Verify Your Email</h1>
        <p>
          We have sent a verification link to{" "}
          <strong title={unverifiedEmail}>{maskedEmail}</strong>. Please check
          your inbox to complete the process.
        </p>
        <p>
          If you entered the wrong email or didn't receive the verification
          email, please update your email below:
        </p>
        <div className="input-section">
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading || isCooldown}
            className="email-input"
          />
          <button
            onClick={handleResendVerification}
            disabled={isLoading || isCooldown}
            className={`btn ${isLoading || isCooldown ? "disabled" : ""}`}
          >
            {isLoading ? (
              <span className="spinner" />
            ) : isCooldown ? (
              `Please wait... (${cooldownTimeLeft}s)`
            ) : (
              "Resend Verification Email"
            )}
          </button>
        </div>
        <p className="info">
          <span>
            If the issue persists, please contact support for assistance.
          </span>
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationInfo;
