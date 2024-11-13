import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/Forms.scss";
import "../styles/AddDIDs.scss";
import { useDispatch, useSelector } from "react-redux";
import { didAsyncActions, clearMessages } from "../redux/slices/didSlice";

const AddDIDs = () => {
  const dispatch = useDispatch();
  const [csvFile, setCsvFile] = useState(null);
  const { added, message, errors } = useSelector((state) => state.did);
  const [isAddingDIDs, setIsAddingDIDs] = useState(false);

  const initialValues = {
    didNumber: "",
    country: "",
    state: "",
    areaCode: "",
  };

  const validationSchema = Yup.object({
    didNumber: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    state: Yup.string().required("Required"),
    areaCode: Yup.string().required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await dispatch(didAsyncActions.addDID({ data: values }));
      
      // Check if the DID was added successfully
      if (result.meta.requestStatus === "fulfilled") {
        resetForm(); // Reset the form only if the DID is added successfully
      }
    } catch (error) {
      console.error("Failed to add DID:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (csvFile) {
      try {
        const formData = new FormData();
        formData.append("file", csvFile);
        await dispatch(didAsyncActions.addDIDsFromFile({ data: formData }));
        setIsAddingDIDs(true);
      } catch (error) {
        console.error("Failed to add DIDs from file:", error);
      }
    } else {
      alert("Please select a CSV file to upload.");
    }
  };

  const handleAddMoreDIDs = () => {
    dispatch(clearMessages());
    setCsvFile(null);
    setIsAddingDIDs(false);
  };

  return (
    <div className="dids-page">
      {!isAddingDIDs ? (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form">
              <div className="main-form">
                <h1>Add Single DID</h1>
                <h6>Enter Details to create new DID</h6>
                <div className="form-group">
                  <Field type="text" name="didNumber" required />
                  <label htmlFor="didNumber">DID Number</label>
                  <ErrorMessage name="didNumber" component="div" className="error" />
                </div>
                <div className="form-group">
                  <Field type="text" name="country" required />
                  <label htmlFor="country">Country</label>
                  <ErrorMessage name="country" component="div" className="error" />
                </div>
                <div className="form-group">
                  <Field type="text" name="state" required />
                  <label htmlFor="state">State</label>
                  <ErrorMessage name="state" component="div" className="error" />
                </div>
                <div className="form-group">
                  <Field type="text" name="areaCode" required />
                  <label htmlFor="areaCode">Area Code</label>
                  <ErrorMessage name="areaCode" component="div" className="error" />
                </div>
                <button
                  type="submit"
                  className="btn"
                  disabled={isSubmitting}
                >
                  Add DID
                </button>
              </div>

              <div className="csv-upload-section">
                <h1>Add DIDs in Bulk</h1>
                <h6>Please upload a CSV file with the necessary data.</h6>
                <div className="file-upload-container">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="file-input"
                  />
                  <button type="button" className="btn" onClick={handleFileUpload}>
                    Upload
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="process-summary">
          <h1>Process Summary</h1>
          <p>{message}</p>
          <p> Number of DIDs added successfully: {added}</p>
          <p>Number of DIDs that were not added due to errors: {errors.length}</p>

          {errors.length > 0 && (
            <div className="error-list">
              <h2>Errors</h2>
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="error-item">
                    <span className="error-number">{error.didNumber}</span>
                    <span className="error-message">{error.errors[0]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="button-container">
            <button className="btn" onClick={handleAddMoreDIDs}>
              Add More DIDs
            </button>
            <button className="btn" onClick={() => window.location.reload()}>
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDIDs;
