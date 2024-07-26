import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/Forms.scss";
import { serverAsyncActions } from "../redux/slices/serverSlice";
import { useDispatch } from "react-redux";

const CreateServerClient = () => {
  const dispatch = useDispatch();
  const [isSubmitDisabled, setSubmitDisabled] = useState(false);

  const initialValues = {
    numberOfAgents: "",
    locationOfAgents: "",
  };

  const validationSchema = Yup.object({
    numberOfAgents: Yup.number()
      .typeError("Must be a number")
      .required("Required"),
    locationOfAgents: Yup.string().required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const resultAction = await dispatch(
        serverAsyncActions.createServer({ data: { agentCredentials: values } })
      );

      if (serverAsyncActions.createServer.fulfilled.match(resultAction)) {
        setSubmitDisabled(true);
        window.location.reload();
        
      }
    } catch (error) {
      console.error("Failed to create server:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="main-form">
        <h1>Create a new server</h1>
        <h6>Enter Agents Details to create new server</h6>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form">
              <div className="form-group">
                <Field type="text" name="numberOfAgents" required />
                <label htmlFor="numberOfAgents">Number of Agents</label>
                <ErrorMessage
                  name="numberOfAgents"
                  component="div"
                  className="error"
                />
              </div>
              <div className="form-group">
                <Field type="text" name="locationOfAgents" required />
                <label htmlFor="locationOfAgents">Location of Agents</label>
                <ErrorMessage
                  name="locationOfAgents"
                  component="div"
                  className="error"
                />
              </div>
              <button
                type="submit"
                className="btn"
                disabled={isSubmitting || isSubmitDisabled}
              >
                Create Server
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateServerClient;
