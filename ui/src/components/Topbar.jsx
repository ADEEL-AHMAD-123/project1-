import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaSearch, FaUserCircle, FaShoppingCart, FaCog, FaTimes, FaFilter } from "react-icons/fa";
import "../styles/Topbar.scss";
import { useSelector } from "react-redux";

const Topbar = ({ toggleSidebar }) => {
    // Extract Role and hasBillingAccount from the user state
    const { Role, hasBillingAccount } = useSelector(state => state.user);
    // Extract credit from the billing state
    const { credit } = useSelector(state => state.billing);

    const location = useLocation(); // Get the current location

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log("Search Query: ", searchQuery);
    };

    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    // Ensure credit is a number and provide a fallback
    const displayedCredit = Number(credit) ? Number(credit).toFixed(2) : "0.00";

    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className="logo">
                    {Role === "client" ? (
                        <>
                            {/* Display credit if hasBillingAccount is true */}
                            {hasBillingAccount ? (
                                <h2>${displayedCredit}</h2>  
                            ) : (
                                <h2>$0.00</h2>  
                            )}
                            <p>available balance</p>
                        </>
                    ) : (
                        <h2>Logo</h2>
                    )}
                </div>
                <FaBars className="icon hamburger-icon" onClick={toggleSidebar} />
                <FaSearch className="icon mobile-search" onClick={handleSearchClick} />
            </div>

            <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
                <form onSubmit={handleSearchSubmit} className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search"
                        className="search-input"
                    />
                    <FaFilter className="icon filter-icon" />
                    <FaTimes className="icon close-icon" onClick={handleSearchClick} />
                </form>
            </div>

            <div className="topbar-right">
                {/* Add active class to respective icons based on current page */}
                <Link to="/cart">
                    <FaShoppingCart className={`icon ${location.pathname === '/cart' ? 'active' : ''}`} />
                </Link>
                <Link to="/settings">
                    <FaCog className={`icon ${location.pathname === '/settings' ? 'active' : ''}`} />
                </Link>
                <Link to="/profile">
                    <FaUserCircle className={`icon ${location.pathname === '/profile' ? 'active' : ''}`} />
                </Link>
            </div>
        </div>
    );
};

export default Topbar;
