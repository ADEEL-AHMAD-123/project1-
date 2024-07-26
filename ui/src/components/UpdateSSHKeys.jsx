import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';
import '../styles/Forms.scss'; // Importing common form styles

const UpdateSSHKeys = () => {
    const [showPublicKey, setShowPublicKey] = useState(false);
    const { User, loading, error } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const initialValues = {
        publicKey: '',
    };

    const validationSchema = Yup.object({
        publicKey: Yup.string().required('Public key is required'),
    });

    const handleSubmit = (values) => {
        dispatch(userAsyncActions.updateSSH({ data: values })).then(() => {
            dispatch(userAsyncActions.getUserProfile({ requestData: "" }));
        });
    };

    // Determine if SSH keys are present
    const hasSSHKeys = User && User.sshKeys && User.sshKeys.publicKey;

    return (
        <div className="main-section">
            <div className="main-form">
                <h1>{`${hasSSHKeys ? "Update " : "Add"} SSH Key`}</h1>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="form-group">
                                <Field
                                    type={showPublicKey ? "text" : "password"}
                                    name="publicKey"
                                    required
                                />
                                <label htmlFor="publicKey">Public Key</label>
                                <div className="password-group">
                                    {showPublicKey ? (
                                        <FaEyeSlash
                                            className="toggle-password"
                                            onClick={() => setShowPublicKey(!showPublicKey)}
                                        />
                                    ) : (
                                        <FaEye
                                            className="toggle-password"
                                            onClick={() => setShowPublicKey(!showPublicKey)}
                                        />
                                    )}
                                </div>
                                <ErrorMessage name="publicKey" component="div" className="error" />
                            </div>
                            <button type="submit" className='btn'>
                                {hasSSHKeys ? "Update " : "Add"} SSH Key
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default UpdateSSHKeys;
