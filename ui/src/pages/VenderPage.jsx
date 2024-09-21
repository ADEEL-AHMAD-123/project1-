import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import Tabs from '../components/Tabs';
import AllVendors from '../components/AllVendors';
import AddVendor from '../components/AddVendor';

const VendorPage = () => {
    const userRole = useSelector(state => state.user.Role);

    const tabs = [
        { key: 'allVendors', label: 'Vendors', icon: () => <FontAwesomeIcon icon={faList} />, content: <AllVendors /> },
        { key: 'addVendor', label: 'Add Vendor', icon: () => <FontAwesomeIcon icon={faPlusSquare} />, content: <AddVendor /> },
    ];

    return (
        <div className="page">
            {userRole === 'admin' ? (
                <Tabs tabs={tabs} tabKey="vendorTabs" /> 
            ) : (
                <AllVendors />
            )}
        </div>
    );
};

export default VendorPage;
