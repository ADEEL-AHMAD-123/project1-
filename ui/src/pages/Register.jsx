import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../styles/Login.scss'; // Reuse the existing SCSS file
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing icons from react-icons

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        keepLoggedIn: false,
    };

    const validationSchema = Yup.object({
        firstName: Yup.string().required('Required'),
        lastName: Yup.string().required('Required'),
        email: Yup.string().email('Invalid email format').required('Required'),
        password: Yup.string().required('Required'),
    });

    const handleSubmit = (values) => {
        // Dispatch your Redux action or API call here for registration
        console.log(values);
    };

    return (
        <div className="login-page">
            <div className="login-form">
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
                                <ErrorMessage name="firstName" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="text" name="lastName" required />
                                <label htmlFor="lastName">Last Name</label>
                                <ErrorMessage name="lastName" component="div" className="error" />
                            </div>
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
                            </div>
                            <button type="submit" disabled={isSubmitting}>
                                Register
                            </button>
                            <div className="signup-link">
                                Already have an account? <a href="/login">Log In</a>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Register;
