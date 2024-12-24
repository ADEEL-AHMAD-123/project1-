import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userAsyncActions,clearUnverifiedEmail } from "../redux/slices/userSlice";
import Loader from "../components/Loader"; 
import ErrorCard from "../components/ErrorCard";


const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Extracting state from Redux store
  const { isLoading, error, verified } = useSelector((state) => state.user);

  // Local state to track access validity and state readiness
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [fromEmailVerificationFlow, setFromEmailVerificationFlow] = useState(false);

  useEffect(() => {
    // Extract query parameters
    const params = new URLSearchParams(location.search);
    const isFromVerificationLink = params.get("fromVerificationLink") === "true";
    setFromEmailVerificationFlow(isFromVerificationLink);
    setIsStateLoaded(true); // Mark the state as loaded
  }, [location.search]);

  useEffect(() => {
    // if (!isStateLoaded || !fromEmailVerificationFlow) {
    //   return;
    // }

    const verifyUserEmail = async () => {
      try {
        // Dispatch the verifyEmail action
        await dispatch(userAsyncActions.verifyEmail({ requestData: token }));
      } catch (err) {
        console.error("Error in email verification", err);
      }
    };

    verifyUserEmail();
  }, [dispatch, token, isStateLoaded, fromEmailVerificationFlow]);

  useEffect(() => {
    if (verified) {
      // Once email is verified, clear the unverified email from the state
      dispatch(clearUnverifiedEmail()); // Dispatch the clearUnverifiedEmail action
      navigate("/login"); // Redirect to login after successful verification
    }
  }, [verified, dispatch, navigate]);

  // Display loader while state is being updated
  if (!isStateLoaded) {
    return <Loader />;
  }

  // Restrict access if user is not coming from the appropriate flow
  if (!fromEmailVerificationFlow) {
    return <ErrorCard message="Access Denied. You cannot access this page directly." buttonLabel="Go Back" redirectLink="/" />;
  }

  // Show the loader if verification is in progress
  if (isLoading) {
    return <Loader />;
  }

  // Display error card if there's an error
  if (error) {
    return <ErrorCard message={error.message} buttonLabel="Go Back" redirectLink="/" />;
  }

  // Default UI for verification
  return (
    <div className="verify-email-page">
      {!verified && <p>Please wait while we verify your email...</p>}
      {verified && <p>Your email has been successfully verified!</p>}
    </div>
  );
};

export default VerifyEmail;
