import '../styles/Forms.scss';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';

const CompleteProfile = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.User);

    const isProfileComplete = user.zipcode && user.phone;

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

        dispatch(userAsyncActions.updateProfile({ data: formData }));

    };

    return (
        <div className='main-section'>
            <div className="main-form">
                <h1>{isProfileComplete ? "Update" : "Complete"} Profile</h1>
                <h6>Enter your details to {isProfileComplete ? "Update" : "Complete"} your profile</h6>
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
                            <button type="submit" disabled={isSubmitting} className='btn'>
                                {isProfileComplete ? "Update" : "Complete"} Profile
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CompleteProfile;
