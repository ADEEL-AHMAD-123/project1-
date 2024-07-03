import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../styles/Login.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing icons from react-icons

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        email: '',
        password: '',
        keepLoggedIn: false,
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Required'),
        password: Yup.string().required('Required'),
    });

    const handleSubmit = (values) => {
        // Handle form submission
        console.log(values);
    };

    return (
        <div className="login-page">
            <div className="login-form">
                <h1>Hi, welcome back</h1>
                <h6>Enter your credentials to continue</h6>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
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
                            <div className="form-options">
                                <label>
                                    <Field type="checkbox" name="keepLoggedIn" />
                                    Keep me logged in
                                </label>
                                <a href="/forgot-password">Forgot password?</a>
                            </div>
                            <button type="submit" disabled={isSubmitting}>
                                Log In
                            </button>
                            <div className="signup-link">
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
