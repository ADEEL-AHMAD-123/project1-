import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import Tabs from '../components/Tabs';
import AllServers from '../components/AllServers';
import CreateServer from '../components/CreateServer';
import CreateServerClient from '../components/CreareServerClient';

const ServersPage = () => {
    const userRole = useSelector(state => state.user.Role); // Assuming you have 'role' in your user state

    const tabs = [
        { key: 'allServers', label: 'All Servers', icon: () => <FontAwesomeIcon icon={faServer} />, content: <AllServers /> },
        {
            key: 'createServer',
            label: 'Create Server',
            icon: () => <FontAwesomeIcon icon={faPlusSquare} />,
            content: userRole === 'client' ? <CreateServerClient /> : <CreateServer />
        },
    ];

    return (
        <div className="page">
            <Tabs tabs={tabs} />
        </div>
    );
};

export default ServersPage;
