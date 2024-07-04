import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaCog, FaUsers, FaUserCircle, FaObjectGroup ,FaUser} from 'react-icons/fa';
import '../styles/Sidebar.scss';

const Sidebar = ({ isSidebarOpen }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-heading">ADMIN</div>
            <nav>
                <ul>
                <NavLink to="/profile">
                        <li className={isActive('/profile') ? 'active' : ''}>
                            <FaUser className="icon" />
                            <span>profile</span>
                        </li>
                    </NavLink>
                    <NavLink to="/account-settings">
                        <li className={isActive('/account-settings') ? 'active' : ''}>
                            <FaCog className="icon" />
                            <span>Account Setting</span>
                        </li>
                    </NavLink>

                    <NavLink to="/team">
                        <li className={isActive('/team') ? 'active' : ''}>
                            <FaUsers className="icon" />
                            <span>Team</span>
                        </li>
                    </NavLink>
                    <NavLink to="/roles">
                        <li className={isActive('/roles') ? 'active' : ''}>
                            <FaUserCircle className="icon" />
                            <span>Roles</span>
                        </li>
                    </NavLink>
                    <NavLink to="/groups">
                        <li className={isActive('/groups') ? 'active' : ''}>
                            <FaObjectGroup className="icon" />
                            <span>Groups</span>
                        </li>
                    </NavLink>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
