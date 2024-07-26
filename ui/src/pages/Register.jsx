import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import '../styles/Forms.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { userAsyncActions } from '../redux/slices/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const Register = () => {
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

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

    const handleSubmit = async (values) => {
        const resultAction = await dispatch(userAsyncActions.registerUser({ data: values }));
        if (userAsyncActions.registerUser.fulfilled.match(resultAction)) {
            navigate('/login'); // Redirect to the login page
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
                            <button type="submit" disabled={isSubmitting} className='btn'>
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
