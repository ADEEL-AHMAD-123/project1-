import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faLock } from '@fortawesome/free-solid-svg-icons';
import '../styles/Profile.scss';
import ProfileDetails from '../components/ProfileDetails'; 
import CompleteProfile from '../components/CompleteProfile';
import ChangePassword from '../components/ChangePassword';

// import ChangePassword from './ChangePassword';
// import EditProfile from './EditProfile';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile'); // State to track active tab

    // Function to handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="profile-page">
            <div className="tabs">
                <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
                    <FontAwesomeIcon icon={faUser} /> Profile
                </div>
                <div className={`tab ${activeTab === 'completeProfile' ? 'active' : ''}`} onClick={() => handleTabChange('updateProfile')}>
                    <FontAwesomeIcon icon={faEdit} /> Complete Profile
                </div>
                <div className={`tab ${activeTab === 'changePassword' ? 'active' : ''}`} onClick={() => handleTabChange('changePassword')}>
                    <FontAwesomeIcon icon={faLock} /> Change Password
                </div>
            </div>
            <div className="profile-content">
                <div className="content-section">
                    {activeTab === 'profile' && <ProfileDetails />}
                    {activeTab === 'updateProfile' && <CompleteProfile />}
                    {activeTab === 'changePassword' && <ChangePassword />}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
