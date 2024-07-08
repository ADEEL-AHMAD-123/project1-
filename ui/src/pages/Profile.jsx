import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faLock, faSync } from '@fortawesome/free-solid-svg-icons';
import Tabs from '../components/Tabs';
import ProfileDetails from '../components/ProfileDetails'; 
import CompleteProfile from '../components/CompleteProfile';
import ChangePassword from '../components/ChangePassword';

const ProfilePage = () => {
    const user = useSelector(state => state.user.User);

    const isProfileComplete = user.zipcode && user.phone;

    const tabs = [
        { key: 'profile', label: 'Profile', icon: () => <FontAwesomeIcon icon={faUser} />, content: <ProfileDetails /> },
        { 
            key: 'completeProfile', 
            label: isProfileComplete ? 'Update Profile' : 'Complete Profile', 
            icon: () => <FontAwesomeIcon icon={isProfileComplete ? faSync : faEdit} />, 
            content: <CompleteProfile /> 
        },
        { key: 'changePassword', label: 'Change Password', icon: () => <FontAwesomeIcon icon={faLock} />, content: <ChangePassword /> },
    ];

    return (
        <div className="page">
            <Tabs tabs={tabs} />
        </div>
    );
};

export default ProfilePage;
