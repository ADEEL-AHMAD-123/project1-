import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { tabsConfig } from '../config/tabsConfig';
import '../styles/Sidebar.scss';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const location = useLocation();
    const role = useSelector((state) => state.user.Role);


    const isActive = (path) => location.pathname === path;

    const handleLinkClick = () => {
        if (window.innerWidth <= 768) {
            toggleSidebar(); // Hide the sidebar when a link is clicked on small devices
        }
    };

    const renderTabs = () => {
        return tabsConfig.map((tab) => {
            if (tab.roles.includes(role)) {
                return (
                    <NavLink to={tab.path} key={tab.path} onClick={handleLinkClick}>
                        <li className={isActive(tab.path) ? 'active' : ''}>
                            <tab.icon className="icon" />
                            <span>{tab.label}</span>
                        </li>
                    </NavLink>
                );
            }
            return null;
        });
    };

    return (
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-heading">{role}</div>
            <nav>
                <ul>
                    {renderTabs()}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
