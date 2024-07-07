import '../styles/Forms.scss';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing icons from react-icons

const ChangePassword = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initialValues = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object({
        currentPassword: Yup.string().required('Required'),
        newPassword: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .required('Required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Required'),
    });

    const handleSubmit = (values) => {
        // Handle form submission
        console.log(values);
    };

    return (
        <div className='change-password-section'>
            <div className="auth-form">
                <h1>Change Password</h1>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="form-group password-group">
                                <Field
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    required
                                />
                                <label htmlFor="currentPassword">Current Password</label>
                                {showCurrentPassword ? (
                                    <FaEyeSlash
                                        className="toggle-password"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    />
                                ) : (
                                    <FaEye
                                        className="toggle-password"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    />
                                )}
                                <ErrorMessage name="currentPassword" component="div" className="error" />
                            </div>
                            <div className="form-group password-group">
                                <Field
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    required
                                />
                                <label htmlFor="newPassword">New Password</label>
                                {showNewPassword ? (
                                    <FaEyeSlash
                                        className="toggle-password"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    />
                                ) : (
                                    <FaEye
                                        className="toggle-password"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    />
                                )}
                                <ErrorMessage name="newPassword" component="div" className="error" />
                            </div>
                            <div className="form-group password-group">
                                <Field
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                />
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                {showConfirmPassword ? (
                                    <FaEyeSlash
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                ) : (
                                    <FaEye
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                )}
                                <ErrorMessage name="confirmPassword" component="div" className="error" />
                            </div>
                            <button type="submit" disabled={isSubmitting}>
                                Update Password
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};



export default ChangePassword;
