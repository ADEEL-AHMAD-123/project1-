// src/components/AddToTeam.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';
import "../styles/Forms.scss";

const AddToTeam = () => {
    const dispatch = useDispatch();

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'client',
    };

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        role: Yup.string().required('Role is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        // Dispatch action to add new team member
        dispatch(userAsyncActions.registerUser({ data: values }));
        setSubmitting(false);
    };

    return (
        <div className='main-section'>
            <div className="main-form">
                <h1>Add to Team</h1>
                <h6>Enter details to add a new team member</h6>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="form-group">
                                <Field type="text" name="firstName" />
                                <label htmlFor="firstName">First Name</label>
                                <ErrorMessage name="firstName" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="text" name="lastName" />
                                <label htmlFor="lastName">Last Name</label>
                                <ErrorMessage name="lastName" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="email" name="email" />
                                <label htmlFor="email">Email</label>
                                <ErrorMessage name="email" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="password" name="password" />
                                <label htmlFor="password">Password</label>
                                <ErrorMessage name="password" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field as="select" name="role">
                                    <option value="client">Client</option>
                                    <option value="supportive staff">Supportive Staff</option>
                                    <option value="admin">Admin</option>
                                </Field>
                                <label htmlFor="role">Role</label>
                                <ErrorMessage name="role" component="div" className="error" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className='btn'>
                                Add to Team
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AddToTeam;
