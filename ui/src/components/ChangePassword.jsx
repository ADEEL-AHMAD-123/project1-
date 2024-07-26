import '../styles/Forms.scss';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = () => {
    const dispatch = useDispatch();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initialValues = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object({
        oldPassword: Yup.string().required('Required'),
        newPassword: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .required('Required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Required'),
    });

    const handleSubmit = (values) => {
        dispatch(userAsyncActions.updatePassword({ data: values }));
    };

    return (
        <div className='main-section password-section'>
            <div className="main-form">
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
                                    type={showOldPassword ? "text" : "password"}
                                    name="oldPassword"
                                    required
                                />
                                <label htmlFor="oldPassword">Old Password</label>
                                {showOldPassword ? (
                                    <FaEyeSlash
                                        className="toggle-password"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    />
                                ) : (
                                    <FaEye
                                        className="toggle-password"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    />
                                )}
                                <ErrorMessage name="oldPassword" component="div" className="error" />
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
                            <button type="submit" className='btn' >
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
