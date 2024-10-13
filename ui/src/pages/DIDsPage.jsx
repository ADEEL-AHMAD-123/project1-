import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faListAlt, faPlusSquare, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import Tabs from '../components/Tabs';
import BuyDIDs from '../components/BuyDids';
import BuyDIDsBulk from '../components/BuyDIDsBulk';
import MyDIDs from '../components/MyDids';
import AddDIDs from '../components/AddDids';
import DIDsPricing from '../components/DIDsPricing'; // Assuming this component handles pricing

const DIDPage = () => {
    const userRole = useSelector(state => state.user.Role); // Use 'role' as it's more typical in Redux state naming

    // Define the tabs based on the user's role
    const tabs = [
        // Common tab for all users to buy DIDs
        { key: 'buyDIDs', label: 'Buy DIDs', icon: () => <FontAwesomeIcon icon={faPhone} />, content: <BuyDIDs /> },
        
        // Conditionally render "My DIDs" for clients and "DIDs Pricing" for admins/supportive staff
        userRole === 'client'
            ? { key: 'myDIDs', label: 'My DIDs', icon: () => <FontAwesomeIcon icon={faListAlt} />, content: <MyDIDs /> }
            : { key: 'didsPricing', label: 'DIDs Pricing', icon: () => <FontAwesomeIcon icon={faDollarSign} />, content: <DIDsPricing /> },
        
        // Conditionally render "Add DIDs" for admin/supportive staff or "Buy DIDs in Bulk" for clients
        userRole === 'client'
            ? { key: 'buyDIDsInBulk', label: 'Buy DIDs in Bulk', icon: () => <FontAwesomeIcon icon={faPlusSquare} />, content: <BuyDIDsBulk /> }
            : { key: 'addDIDs', label: 'Add DIDs', icon: () => <FontAwesomeIcon icon={faPlusSquare} />, content: <AddDIDs /> }
    ];

    return (
        <div className="page">
            <Tabs tabs={tabs} tabKey="didPageTabs" /> 
        </div>
    ); 
};

export default DIDPage;
