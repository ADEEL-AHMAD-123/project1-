import '../styles/Forms.scss';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const CompleteProfile = () => {
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        phone: '',
        address: '',
        zipcode: '',
        avatar: null, 
    };

    const validationSchema = Yup.object({
        phone: Yup.string().required('Phone is required'),
        address: Yup.string().required('Address is required'),
        zipcode: Yup.string().required('Zipcode is required'),
        avatar: Yup.mixed().required('Profile picture is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const formData = new FormData();
        formData.append('phone', values.phone);
        formData.append('address', values.address);
        formData.append('zipcode', values.zipcode);
        formData.append('avatar', values.avatar);

        try {
            const response = await axios.put('http://localhost:8000/api/v1/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                toast.success('Profile updated successfully');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='update-profile-section'>
            <div className="auth-form">
                <h1>Complete Profile</h1>
                <h6>Enter your details to complete your profile</h6>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            <div className="form-group">
                                <Field type="text" name="phone" />
                                <label htmlFor="phone">Phone</label>
                                <ErrorMessage name="phone" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="text" name="zipcode" />
                                <label htmlFor="zipcode">Zipcode</label>
                                <ErrorMessage name="zipcode" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <Field type="text" name="address" />
                                <label htmlFor="address">Address</label>
                                <ErrorMessage name="address" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <input
                                    type="file"
                                    id="avatar"
                                    name="avatar"
                                    onChange={(event) => {
                                        setFieldValue("avatar", event.currentTarget.files[0]);
                                    }}
                                />
                                <label htmlFor="avatar">Profile Picture</label>
                                <ErrorMessage name="avatar" component="div" className="error" />
                            </div>
                            <button type="submit" disabled={isSubmitting}>
                                Update Profile
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CompleteProfile;
