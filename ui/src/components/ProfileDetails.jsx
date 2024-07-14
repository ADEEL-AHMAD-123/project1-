import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userAsyncActions } from '../redux/slices/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/ProfileDetails.scss';

const ProfileDetails = () => {
    const dispatch = useDispatch();
    const { User, loading, error } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(userAsyncActions.getUserProfile({ requestData: "" }));
    }, [dispatch]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!User) return <p>No user data available</p>;  // Add this check

    return (
        <div className="profile-details">
            <div className="left-section">
                <div className="user-card">
                    <div className="user-image">
                        <img src={User.avatar?.url} alt="Profile" />
                    </div>
                    <div className="info">
                        <p><FontAwesomeIcon icon={faEnvelope} /> <span>Email:</span> <span className="value">{User.email}</span></p>
                        <p><FontAwesomeIcon icon={faPhone} /> <span>Phone:</span> <span className="value">{User.phone}</span></p>
                        <p><FontAwesomeIcon icon={faMapMarkerAlt} /> <span>Location:</span> <span className="value">{User.address}</span></p>
                    </div>
                </div>
            </div>
            <div className="right-section">
                <div className="about-me">
                    <h3>About Me</h3>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem asperiores impedit harum reprehenderit vel commodi necessitatibus excepturi dolorem quia eveniet, animi nobis tempora quae, cum deleniti culpa enim. Pariatur architecto </p>
                </div>
                <div className="personal-details">
                    <h3>Personal Details</h3>
                    <div className="detail"><span className="field-name">First Name:</span> <span className="colon">:</span> <span className="value">{User.firstName}</span></div>
                    <div className="detail"><span className="field-name">Last Name:</span> <span className="colon">:</span> <span className="value">{User.lastName}</span></div>
                    <div className="detail"><span className="field-name">Email:</span> <span className="colon">:</span> <span className="value">{User.email}</span></div>
                    <div className="detail"><span className="field-name">Phone:</span> <span className="colon">:</span> <span className="value">{User.phone}</span></div>
                    <div className="detail"><span className="field-name">Zipcode:</span> <span className="colon">:</span> <span className="value">{User.zipcode}</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
