import React, { useState } from "react";
import { FaBars, FaSearch, FaUserCircle, FaBell, FaCog, FaTimes, FaFilter } from "react-icons/fa";
import "../styles/Topbar.scss";

const Topbar = ({ toggleSidebar }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Handle the search submit logic here
        console.log("Search Query: ", searchQuery);
    };

    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className="logo">LOGO</div>
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
                <FaBell className="icon" />
                <FaCog className="icon" />
                <FaUserCircle className="icon" />
            </div>
        </div>
    );
};

export default Topbar;
