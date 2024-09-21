import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Tabs from '../components/Tabs';
import TeamMembers from '../components/TeamMembers';
import AddToTeam from '../components/AddToTeam';

const TeamPage = () => {
    const tabs = [
        { key: 'teamMembers', label: 'Team Members', icon: () => <FontAwesomeIcon icon={faUsers} />, content: <TeamMembers /> },
        { key: 'addToTeam', label: 'Add to Team', icon: () => <FontAwesomeIcon icon={faUserPlus} />, content: <AddToTeam /> },
    ];

    return (
        <div className="page">
            <Tabs tabs={tabs} tabKey="teamPageTabs" /> {/* Unique key for TeamPage */}
        </div>
    );
};

export default TeamPage;
