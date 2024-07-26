import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { vendorAsyncActions } from '../redux/slices/vendorSlice';
import "../styles/Forms.scss";

const AddVendor = () => {
    const dispatch = useDispatch();

    const initialValues = {
        providerName: '',
        providerId: '',
        apiEndpointUrl: '',
        website: '',
        startDate: ''
    };

    const validationSchema = Yup.object().shape({
        providerName: Yup.string().required('Provider Name is required'),
        providerId: Yup.string().required('Provider ID is required'),
        apiEndpointUrl: Yup.string().url('Invalid URL').required('API Endpoint URL is required'),
        website: Yup.string().url('Invalid URL'),
        startDate: Yup.date().required('Start Date is required')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        dispatch(vendorAsyncActions.createVendor({ data: values }));
        setSubmitting(false);
    };

    return (
        <div className='main-section'>
            <div className="main-form">
                <h1>Add Vendor</h1>
                <h6>Enter details to add a new vendor</h6>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="form-group">
                                <Field type="text" name="providerName" />
                                <label htmlFor="providerName">Provider Name</label>
                                <ErrorMessage name="providerName" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="text" name="providerId" />
                                <label htmlFor="providerId">Provider ID</label>
                                <ErrorMessage name="providerId" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="url" name="apiEndpointUrl" />
                                <label htmlFor="apiEndpointUrl">API Endpoint URL</label>
                                <ErrorMessage name="apiEndpointUrl" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="url" name="website" />
                                <label htmlFor="website">Website</label>
                                <ErrorMessage name="website" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="date" name="startDate" />
                                <label htmlFor="startDate">Start Date</label>
                                <ErrorMessage name="startDate" component="div" className="error" />
                            </div>
                            
                            <button type="submit" disabled={isSubmitting} className='btn'>
                                Add Vendor
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AddVendor;
