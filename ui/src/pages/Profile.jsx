import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faLock, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/Profile.scss';

const ProfilePage = () => {
    return (
        <div className="profile-page">
            <div className="tabs">
                <div className="tab">
                    <FontAwesomeIcon icon={faUser} /> Profile
                </div>
                <div className="tab">
                    <FontAwesomeIcon icon={faEdit} /> Update Profile
                </div>
                <div className="tab">
                    <FontAwesomeIcon icon={faLock} /> Change Password
                </div>
            </div>
            <div className="profile-content">
                <div className="left-section">
                    <div className="user-card">
                        <div className="user-image">
                            <FontAwesomeIcon icon={faUser} size="6x" />
                        </div>
                        <div className="info">
                            <p><FontAwesomeIcon icon={faEnvelope} /> <span>Email:</span> <span className="value">user@example.com</span></p>
                            <p><FontAwesomeIcon icon={faPhone} /> <span>Phone:</span> <span className="value">+123456789</span></p>
                            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> <span>Location:</span> <span className="value">New York, USA</span></p>
                        </div>
                    </div>
                </div>
                <div className="right-section">
                    <div className="about-me">
                        <h3>About Me</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam scelerisque aliquam odio et faucibus.</p>
                    </div>
                    <div className="personal-details">
                        <h3>Personal Details</h3>
                        <div className="detail"><span>First Name:</span> <span className="value">John</span></div>
                        <div className="detail"><span>Last Name:</span> <span className="value">Doe</span></div>
                        <div className="detail"><span>Email:</span> <span className="value">user@example.com</span></div>
                        <div className="detail"><span>Phone:</span> <span className="value">+123456789</span></div>
                        <div className="detail"><span>Zipcode:</span> <span className="value">10001</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
