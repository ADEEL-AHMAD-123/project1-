import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import Tabs from '../components/Tabs';
import UsageSummary from '../components/UsageSummary';
import InboundUsage from '../components/InboundUsage';
import OutboundUsage from '../components/OutboundUsage';

const UsagePage = () => {
    const userRole = useSelector(state => state.user.Role);

    const tabs = [
        { key: 'usageSummary', label: 'Usage Summary', icon: () => <FontAwesomeIcon icon={faChartLine} />, content: <UsageSummary /> },
        { key: 'inboundUsage', label: 'Inbound Usage', icon: () => <FontAwesomeIcon icon={faDownload} />, content: <InboundUsage /> },
        { key: 'outboundUsage', label: 'Outbound Usage', icon: () => <FontAwesomeIcon icon={faUpload} />, content: <OutboundUsage /> },
    ];

    return (
        <div className="page">
            {userRole === 'admin' ? (
                <Tabs tabs={tabs} />
            ) : (
                <UsageSummary /> 
            )}
        </div>
    ); 
};

export default UsagePage;
