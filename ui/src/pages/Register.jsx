import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { toast } from 'react-toastify';
import "../styles/Forms.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { userAsyncActions,storeUnverifiedEmail } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { error } = useSelector((state) => state.user); // Ensure error is part of the state
  const navigate = useNavigate();

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    whatsappNumber: "",
    keepLoggedIn: false,
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email format").required("Required"),
    password: Yup.string().required("Required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .required("Required"),
    whatsappNumber: Yup.string()
      .matches(/^\d{10}$/, "WhatsApp number must be 10 digits")
      .required("Required"),
  });

  const handleSubmit = async (values) => {
    const resultAction = await dispatch(
      userAsyncActions.registerUser({ data: values })
    );

    if (userAsyncActions.registerUser.fulfilled.match(resultAction)) {
      // Successful registration
      dispatch(storeUnverifiedEmail(values.email)); // Store the unverified email
      navigate("/email-verification-info", { state: { fromRegister: true } }); // Redirect to email verification info page
    } else {

      toast.error(resultAction.payload.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="main-form">
        <h1>Create an Account</h1>
        <h6>Enter your details to get started</h6>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <Field type="text" name="firstName" required />
                <label htmlFor="firstName">First Name</label>
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="error"
                />
              </div>
              <div className="form-group">
                <Field type="text" name="lastName" required />
                <label htmlFor="lastName">Last Name</label>
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="error"
                />
              </div>
              <div className="form-group">
                <Field type="email" name="email" required />
                <label htmlFor="email">Email Address</label>
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div className="form-group password-group">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                />
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
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error"
                />
              </div>
              <div className="form-group">
                <Field type="text" name="phone" required />
                <label htmlFor="phone">Phone Number</label>
                <ErrorMessage name="phone" component="div" className="error" />
              </div>
              <div className="form-group">
                <Field type="text" name="whatsappNumber" required />
                <label htmlFor="whatsappNumber">WhatsApp Number</label>
                <ErrorMessage
                  name="whatsappNumber"
                  component="div"
                  className="error"
                />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn">
                Register
              </button>
              <div className="switch-link">
                Already have an account? <a href="/login">Login</a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
