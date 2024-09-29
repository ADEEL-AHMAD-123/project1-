import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faListAlt, faPlusSquare, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import Tabs from '../components/Tabs';
import BuyDIDs from '../components/BuyDids';
import MyDIDs from '../components/MyDids';
import AddDIDs from '../components/AddDids';
import DIDsPricing from '../components/DIDsPricing'; // Assuming this component handles pricing

const DIDPage = () => {
    const userRole = useSelector(state => state.user.Role);

    // Tabs available to all users
    const tabs = [
        { key: 'buyDIDs', label: 'Buy DIDs', icon: () => <FontAwesomeIcon icon={faPhone} />, content: <BuyDIDs /> },
        // Conditionally render "My DIDs" or "DIDs Pricing" based on user role
        userRole === 'admin'
            ? { key: 'didsPricing', label: 'DIDs Pricing', icon: () => <FontAwesomeIcon icon={faDollarSign} />, content: <DIDsPricing /> }
            : { key: 'myDIDs', label: 'My DIDs', icon: () => <FontAwesomeIcon icon={faListAlt} />, content: <MyDIDs /> },
        { key: 'addDIDs', label: 'Add DIDs', icon: () => <FontAwesomeIcon icon={faPlusSquare} />, content: <AddDIDs /> },
    ];

    return (
        <div className="page">
            <Tabs tabs={tabs} tabKey="didPageTabs" /> 
        </div>
    ); 
};

export default DIDPage;
