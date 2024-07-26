import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { userAsyncActions } from '../redux/slices/userSlice';
import { serverAsyncActions } from '../redux/slices/serverSlice';
import '../styles/Forms.scss';

const CreateServer = () => {
    const dispatch = useDispatch();
    const { Users, Role } = useSelector((state) => state.user);
    const [expandedSection, setExpandedSection] = useState(null);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [isSubmitDisabled, setSubmitDisabled] = useState(false);
    const errorSummaryRef = useRef(null);
    const [submitClicked, setSubmitClicked] = useState(false);

    useEffect(() => {
        if (Role !== 'client' && !usersLoaded) {
            dispatch(userAsyncActions.getAllUsers());
            setUsersLoaded(true);
        }
    }, [Role, dispatch, usersLoaded]);

    const initialValues = {
        cpu: '',
        ram: '',
        diskSpace: '',
        usage: '',
        buyPriceMonthly: '',
        sellPriceMonthly: '',
        dataCenterName: '',
        city: '',
        country: '',
        networkZone: '',
        numberOfAgents: '',
        locationOfAgents: '',
        agentDialerUrl: '',
        userIdStartRange: '',
        userIdEndRange: '',
        userPassword: '',
        phoneIdStartRange: '',
        phoneIdEndRange: '',
        phoneIdPassword: '',
        sipIpAddress: '',
        ipPort: '',
        adminDialerUrl: '',
        adminUsername: '',
        adminPassword: '',
        monitoringId: '',
        firewallUrl: '',
        firewallUsername: '',
        firewallPassword: '',
        creatingFor: '',
    };

    const validationSchema = Yup.object().shape({
        cpu: Yup.string().required('CPU specification is required'),
        ram: Yup.string().required('RAM specification is required'),
        diskSpace: Yup.string().required('Disk space specification is required'),
        usage: Yup.string().required('Usage specification is required'),
        buyPriceMonthly: Yup.number().required('Buy price monthly is required').positive('Buy price monthly must be a positive number'),
        sellPriceMonthly: Yup.number().required('Sell price monthly is required').positive('Sell price monthly must be a positive number'),
        dataCenterName: Yup.string().required('Data Center Name is required'),
        city: Yup.string().required('City is required'),
        country: Yup.string().required('Country is required'),
        networkZone: Yup.string().required('Network Zone is required'),
        numberOfAgents: Yup.number().required('Number of agents is required').positive('Number of agents must be a positive number'),
        locationOfAgents: Yup.string().required('Location of agents is required'),
        agentDialerUrl: Yup.string().required('Agent dialer URL is required'),
        userIdStartRange: Yup.number().required('User ID start range is required').integer('User ID start range must be an integer'),
        userIdEndRange: Yup.number().required('User ID end range is required').integer('User ID end range must be an integer'),
        userPassword: Yup.string().required('User password is required'),
        phoneIdStartRange: Yup.number().required('Phone ID start range is required').integer('Phone ID start range must be an integer'),
        phoneIdEndRange: Yup.number().required('Phone ID end range is required').integer('Phone ID end range must be an integer'),
        phoneIdPassword: Yup.string().required('Phone ID password is required'),
        sipIpAddress: Yup.string().required('SIP IP address is required'),
        ipPort: Yup.number().required('IP port is required').integer('IP port must be an integer'),
        adminDialerUrl: Yup.string().required('Admin dialer URL is required'),
        adminUsername: Yup.string().required('Admin username is required'),
        adminPassword: Yup.string().required('Admin password is required'),
        monitoringId: Yup.string().required('Monitoring ID is required'),
        firewallUrl: Yup.string().required('Firewall URL is required'),
        firewallUsername: Yup.string().required('Firewall username is required'),
        firewallPassword: Yup.string().required('Firewall password is required'),
        creatingFor: Yup.string().required('User selection is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const dialerSpecifications = {
            cpu: values.cpu,
            ram: values.ram,
            diskSpace: values.diskSpace,
            usage: values.usage,
        };

        const priceDetails = {
            buyPriceMonthly: values.buyPriceMonthly,
            sellPriceMonthly: values.sellPriceMonthly,
        };

        const dialerLocation = {
            dataCenterName: values.dataCenterName,
            city: values.city,
            country: values.country,
            networkZone: values.networkZone,
        };

        const agentCredentials = {
            numberOfAgents: values.numberOfAgents,
            locationOfAgents: values.locationOfAgents,
            agentDialerUrl: values.agentDialerUrl,
            userIdStartRange: values.userIdStartRange,
            userIdEndRange: values.userIdEndRange,
            userPassword: values.userPassword,
            phoneIdStartRange: values.phoneIdStartRange,
            phoneIdEndRange: values.phoneIdEndRange,
            phoneIdPassword: values.phoneIdPassword,
            sipIpAddress: values.sipIpAddress,
            ipPort: values.ipPort,
        };

        const adminCredentials = {
            adminDialerUrl: values.adminDialerUrl,
            adminUsername: values.adminUsername,
            adminPassword: values.adminPassword,
            monitoringId: values.monitoringId,
            firewallUrl: values.firewallUrl,
            firewallUsername: values.firewallUsername,
            firewallPassword: values.firewallPassword,
        };

        const creatingFor = values.creatingFor;

        try {
            const resultAction = await dispatch(
                serverAsyncActions.createServer({
                    data: {
                        dialerSpecifications,
                        priceDetails,
                        dialerLocation,
                        agentCredentials,
                        adminCredentials,
                        creatingFor,
                    },
                })
            );

            if (serverAsyncActions.createServer.fulfilled.match(resultAction)) {
                setSubmitDisabled(true);
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to create server:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleExpand = (section) => {
        setExpandedSection((prevSection) => (prevSection === section ? null : section));
    };

    const renderFormGroups = (sectionName, fields) => (
        <div className={`section-main ${expandedSection === sectionName ? 'expanded' : ''}`}>
            <span onClick={() => toggleExpand(sectionName)} className="section-header">
                {sectionName} {expandedSection === sectionName ? <FaAngleUp /> : <FaAngleDown />}
            </span>
            <div className={`section-content ${expandedSection === sectionName ? 'expanded' : ''}`}>
                {fields.map((field) => (
                    <div key={field.name} className="form-group">
                        <Field type={field.type} name={field.name} />
                        <label htmlFor={field.name}>{field.label}</label>
                        <ErrorMessage name={field.name} component="div" className="error" />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCreatingForSection = () => (
        <div className={`section-main ${expandedSection === 'Creating For' ? 'expanded' : ''}`}>
            <span onClick={() => toggleExpand('Creating For')} className="section-header">
                Creating For {expandedSection === 'Creating For' ? <FaAngleUp /> : <FaAngleDown />}
            </span>
            <div className={`section-content ${expandedSection === 'Creating For' ? 'expanded' : ''}`}>
                <div className="form-group">
                    <Field as="select" name="creatingFor">
                        <option value="">Select a user</option>
                        {Users && Users.filter((user) => user.role === 'client').map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.firstName} {user.lastName}
                            </option>
                        ))}
                    </Field>
                    <ErrorMessage name="creatingFor" component="div" className="error" />
                </div>
            </div>
        </div>
    );

    const handleSubmitClick = (validateForm, submitForm) => {
        validateForm().then((errors) => {
            if (Object.keys(errors).length > 0) {
                errorSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            submitForm();
        });
    };

    return (
        <div className="main-section">
            <div className="main-form">
    
            <div className="form-container">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ validateForm, submitForm }) => (
                        <Form>
                            <h1>Create Server</h1>
                            <h6>Enter the server details below</h6>
                            {submitClicked && (
                                <div ref={errorSummaryRef} className="error-summary">
                                    <p> Form contains errors:</p>
                                    <ErrorMessage name="cpu" component="div" className="error-summary-item" />
                                    <ErrorMessage name="ram" component="div" className="error-summary-item" />
                                    <ErrorMessage name="diskSpace" component="div" className="error-summary-item" />
                                    <ErrorMessage name="usage" component="div" className="error-summary-item" />
                                    <ErrorMessage name="buyPriceMonthly" component="div" className="error-summary-item" />
                                    <ErrorMessage name="sellPriceMonthly" component="div" className="error-summary-item" />
                                    <ErrorMessage name="dataCenterName" component="div" className="error-summary-item" />
                                    <ErrorMessage name="city" component="div" className="error-summary-item" />
                                    <ErrorMessage name="country" component="div" className="error-summary-item" />
                                    <ErrorMessage name="networkZone" component="div" className="error-summary-item" />
                                    <ErrorMessage name="numberOfAgents" component="div" className="error-summary-item" />
                                    <ErrorMessage name="locationOfAgents" component="div" className="error-summary-item" />
                                    <ErrorMessage name="agentDialerUrl" component="div" className="error-summary-item" />
                                    <ErrorMessage name="userIdStartRange" component="div" className="error-summary-item" />
                                    <ErrorMessage name="userIdEndRange" component="div" className="error-summary-item" />
                                    <ErrorMessage name="userPassword" component="div" className="error-summary-item" />
                                    <ErrorMessage name="phoneIdStartRange" component="div" className="error-summary-item" />
                                    <ErrorMessage name="phoneIdEndRange" component="div" className="error-summary-item" />
                                    <ErrorMessage name="phoneIdPassword" component="div" className="error-summary-item" />
                                    <ErrorMessage name="sipIpAddress" component="div" className="error-summary-item" />
                                    <ErrorMessage name="ipPort" component="div" className="error-summary-item" />
                                    <ErrorMessage name="adminDialerUrl" component="div" className="error-summary-item" />
                                    <ErrorMessage name="adminUsername" component="div" className="error-summary-item" />
                                    <ErrorMessage name="adminPassword" component="div" className="error-summary-item" />
                                    <ErrorMessage name="monitoringId" component="div" className="error-summary-item" />
                                    <ErrorMessage name="firewallUrl" component="div" className="error-summary-item" />
                                    <ErrorMessage name="firewallUsername" component="div" className="error-summary-item" />
                                    <ErrorMessage name="firewallPassword" component="div" className="error-summary-item" />
                                    <ErrorMessage name="creatingFor" component="div" className="error-summary-item" />
                                </div>
                            )}

                            {renderFormGroups('Dialer Specifications', [
                                { type: 'text', name: 'cpu', label: 'CPU' },
                                { type: 'text', name: 'ram', label: 'RAM' },
                                { type: 'text', name: 'diskSpace', label: 'Disk Space' },
                                { type: 'text', name: 'usage', label: 'Usage' },
                            ])}

                            {renderFormGroups('Price Details', [
                                { type: 'number', name: 'buyPriceMonthly', label: 'Buy Price Monthly' },
                                { type: 'number', name: 'sellPriceMonthly', label: 'Sell Price Monthly' },
                            ])}

                            {renderFormGroups('Dialer Location', [
                                { type: 'text', name: 'dataCenterName', label: 'Data Center Name' },
                                { type: 'text', name: 'city', label: 'City' },
                                { type: 'text', name: 'country', label: 'Country' },
                                { type: 'text', name: 'networkZone', label: 'Network Zone' },
                            ])}

                            {renderFormGroups('Agent Credentials', [
                                { type: 'number', name: 'numberOfAgents', label: 'Number of Agents' },
                                { type: 'text', name: 'locationOfAgents', label: 'Location of Agents' },
                                { type: 'text', name: 'agentDialerUrl', label: 'Agent Dialer URL' },
                                { type: 'number', name: 'userIdStartRange', label: 'User ID Start Range' },
                                { type: 'number', name: 'userIdEndRange', label: 'User ID End Range' },
                                { type: 'password', name: 'userPassword', label: 'User Password' },
                                { type: 'number', name: 'phoneIdStartRange', label: 'Phone ID Start Range' },
                                { type: 'number', name: 'phoneIdEndRange', label: 'Phone ID End Range' },
                                { type: 'password', name: 'phoneIdPassword', label: 'Phone ID Password' },
                                { type: 'text', name: 'sipIpAddress', label: 'SIP IP Address' },
                                { type: 'number', name: 'ipPort', label: 'IP Port' },
                            ])}

                            {renderFormGroups('Admin Credentials', [
                                { type: 'text', name: 'adminDialerUrl', label: 'Admin Dialer URL' },
                                { type: 'text', name: 'adminUsername', label: 'Admin Username' },
                                { type: 'password', name: 'adminPassword', label: 'Admin Password' },
                                { type: 'text', name: 'monitoringId', label: 'Monitoring ID' },
                                { type: 'text', name: 'firewallUrl', label: 'Firewall URL' },
                                { type: 'text', name: 'firewallUsername', label: 'Firewall Username' },
                                { type: 'password', name: 'firewallPassword', label: 'Firewall Password' },
                            ])}

                            {renderCreatingForSection()}

                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    setSubmitClicked(true);
                                    handleSubmitClick(validateForm, submitForm);
                                }}
                                disabled={isSubmitDisabled}
                            >
                                Submit
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
            </div>
        </div>
    );
};

export default CreateServer;
