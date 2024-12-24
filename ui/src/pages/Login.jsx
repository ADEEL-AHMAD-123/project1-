import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/Forms.scss";
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { userAsyncActions, storeUnverifiedEmail } from "../redux/slices/userSlice";
import { billingAsyncActions } from "../redux/slices/billingSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: "/" } };

  const { error, hasBillingAccount } = useSelector((state) => state.user);

  const initialValues = {
    email: "",
    password: "",
    keepLoggedIn: false,
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Required"),
    password: Yup.string().required("Required"),
  });

  const handleSubmit = async (values) => {
    const resultAction = await dispatch(userAsyncActions.loginUser({ data: values }));
  
    if (userAsyncActions.loginUser.fulfilled.match(resultAction)) {
      navigate(from); // Navigate to the previous page on successful login
    } else if (
      resultAction.payload &&
      resultAction.payload.statusCode === 403 &&
      resultAction.payload.message === "Email not verified"
    ) {
      dispatch(storeUnverifiedEmail(values.email)); // Store the unverified email
      navigate('/email-verification-info', { state: { fromLogin: true } }); // Redirect to the verification info page
    }
    else {
      toast.error(resultAction.payload.message)
    }
  };
  

  useEffect(() => {
    if (hasBillingAccount) {
      dispatch(billingAsyncActions.getBillingAccount({ requestData: "" }));
    }
  }, [hasBillingAccount, dispatch]);

  return (
    <div className="auth-page">
      <div className="main-form">
        <h1>Hi, welcome back</h1>
        <h6>Enter your credentials to continue</h6>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form">
              <div className="form-group">
                <Field type="email" name="email" required />
                <label htmlFor="email">Email Address</label>
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div className="form-group password-group">
                <Field type={showPassword ? "text" : "password"} name="password" required />
                <label htmlFor="password">Password</label>
                {showPassword ? (
                  <FaEyeSlash
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <FaEye
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
                <ErrorMessage name="password" component="div" className="error" />
              </div>

              <button type="submit" className="btn" disabled={isSubmitting}>
                Log In
              </button>
              <div className="form-options">
                <a href="/forgot-password">Forgot password?</a>
              </div>
              <div className="switch-link">
                Don’t have an account? <a href="/signup">Sign Up</a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
