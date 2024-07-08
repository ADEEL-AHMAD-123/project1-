import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/Tabs.scss';

const Tabs = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].key);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    return (
        <div className="tabs-component">
            <div className="tabs">
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.icon && <tab.icon />}
                        {tab.label}
                    </div>
                ))}
            </div>
            <div className="tab-content">
                {tabs.map((tab) =>
                    activeTab === tab.key ? <div key={tab.key}>{tab.content}</div> : null
                )}
            </div>
        </div>
    );
};

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.elementType,
            content: PropTypes.element.isRequired,
        })
    ).isRequired,
};

export default Tabs;
