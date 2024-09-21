import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus } from '@fortawesome/free-solid-svg-icons';
import Tabs from '../components/Tabs';
import AccountDetails from '../components/AccountDetails';
import UpdateSSHKeys from '../components/UpdateSSHKeys';
import { userAsyncActions } from '../redux/slices/userSlice';

const AccountSettings = () => {
    const dispatch = useDispatch();
    const { User, loading, error } = useSelector(state => state.user);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        dispatch(userAsyncActions.getUserProfile({ requestData: "" }));
    }, [dispatch]);

    useEffect(() => {
        if (User) {
            setCurrentUser(User);
        }
    }, [User]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const hasSSHKeys = currentUser && currentUser.sshKeys && currentUser.sshKeys.publicKey;

    const tabs = hasSSHKeys
        ? [
            { key: 'details', label: 'Details', icon: () => <FontAwesomeIcon icon={faUser} />, content: <AccountDetails User={currentUser} /> },
            { key: 'updateDetails', label: 'Update SSH keys', icon: () => <FontAwesomeIcon icon={faPlus} />, content: <UpdateSSHKeys /> },
        ]
        : [
            { key: 'details', label: 'Details', icon: () => <FontAwesomeIcon icon={faUser} />, content: <AccountDetails User={currentUser} /> },
            { key: 'updateDetails', label: 'Add SSH keys', icon: () => <FontAwesomeIcon icon={faPlus} />, content: <UpdateSSHKeys /> },
        ];

    return (
        <div className="page">
            <Tabs tabs={tabs} tabKey="accountSettingsTabs" /> {/* Unique key for AccountSettings */}
        </div>
    );
};

export default AccountSettings;
