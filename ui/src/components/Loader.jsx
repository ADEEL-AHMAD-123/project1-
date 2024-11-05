import React from 'react';
import '../styles/Loader.scss';

const Loader = () => {
    return (
        <div className="loader">
            <div className="loader-spinner"></div>
            <div className="loader-text">Loading...</div>
        </div>
    );
};

export default Loader;
