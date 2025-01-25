import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaSearch, FaUserCircle, FaShoppingCart, FaCog, FaTimes, FaFilter } from "react-icons/fa";
import { initializeSSE } from '../redux/slices/billingSlice';
import "../styles/Topbar.scss";

const Topbar = ({ toggleSidebar }) => {
    const dispatch = useDispatch();
    const { Role, hasBillingAccount } = useSelector(state => state.user);
    const { credit } = useSelector(state => state.billing);

    useEffect(() => {
        dispatch(initializeSSE());
    }, [dispatch]);

    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log("Search Query: ", searchQuery);
    };

    const handleSearchClick = () => setIsSearchOpen(!isSearchOpen);
    const displayedCredit = Number(credit) ? Number(credit).toFixed(2) : "0.00";

    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className='icon-div'>
                    <FaBars className="hamburger-icon icon" onClick={toggleSidebar} />
                </div>
                <div className='icon-div'>
                    <FaSearch className="hamburger-icon icon" onClick={handleSearchClick} />
                </div>
            </div>

            <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
                <form onSubmit={handleSearchSubmit} className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search Here..."
                        className="search-input"
                    />
                    <FaFilter className="icon filter-icon" />
                    <FaTimes className="icon close-icon" onClick={handleSearchClick} />
                </form>
            </div>

            <div className="topbar-right">
                <div className='icon-div'>
                    <Link to="/cart">
                        <FaShoppingCart className={`icon ${location.pathname === '/cart' ? 'active' : ''}`} />
                    </Link>
                </div>
                <div className='icon-div'>
                    <Link to="/settings">
                        <FaCog className={`icon ${location.pathname === '/settings' ? 'active' : ''}`} />
                    </Link>
                </div>
                <div className='icon-div'>
                    <Link to="/profile">
                        <FaUserCircle className={`icon ${location.pathname === '/profile' ? 'active' : ''}`} />
                    </Link>
                </div>
            </div>

            <div className="credit">
                {Role === "client" ? (
                    <>
                        {hasBillingAccount ? (
                            <h2>${displayedCredit}</h2>
                        ) : (
                            <h2>$0.00</h2>
                        )}
                        <p>current balance</p>
                    </>
                ) : (
                    <h2>Logo</h2>
                )}
            </div>
        </div>
    );
};

export default Topbar;
 