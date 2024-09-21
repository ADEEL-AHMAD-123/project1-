import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/Tabs.scss';

const Tabs = ({ tabs, tabKey }) => {
    // Check localStorage for a saved tab, or default to the first tab
    const initialActiveTab = localStorage.getItem(tabKey) || tabs[0].key;
    const [activeTab, setActiveTab] = useState(initialActiveTab);

    useEffect(() => {
        // Whenever the activeTab changes, save it in localStorage
        localStorage.setItem(tabKey, activeTab);
    }, [activeTab, tabKey]);

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
    tabKey: PropTypes.string.isRequired, // Unique key for storing tab state
};

export default Tabs;
