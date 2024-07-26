import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faToggleOn,
  faToggleOff,
  faCircle,
  faMicrochip,
  faMemory,
  faHdd,
  faChartLine,
  faNetworkWired,
  faEuroSign,
  faMapMarkerAlt,
  faDatabase,
  faUsers,
  faCloudDownloadAlt,
  faLayerGroup,
  faNetworkWired as faPublicNetwork,
  faCogs,
  faTasks
} from '@fortawesome/free-solid-svg-icons';
import MapComponent from '../components/MapComponent';
import '../styles/ServerDetails.scss';

const ServerDetails = () => {
  const [isToggled, setIsToggled] = useState(true);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const activities = [
    { description: 'Server created', timestamp: '2024-07-25 14:35:00' },
    { description: 'Backup completed', timestamp: '2024-07-24 10:15:00' },
    { description: 'Server resized', timestamp: '2024-07-23 09:00:00' },
  ];

  return (
    <div className="server-details">
      <header className="server-header">
        <div className="header-left">
          <h5 className="server-name">
            <FontAwesomeIcon icon={faCircle} className="icon-active icon" /> Server Name
          </h5>
          <h5 className="address">5.75.254.208</h5>
        </div>
        <div className="header-right">
          <button className="icon-button" onClick={handleToggle}>
            <FontAwesomeIcon icon={isToggled ? faToggleOn : faToggleOff} className="icon" />
          </button>
          <button className="icon-button">
            <FontAwesomeIcon icon={faLock} className="icon" />
          </button>
        </div>
        <nav className="server-menu">
          <a href="#overview">Overview</a>
          <a href="#graphs">Graphs</a>
          <a href="#backups">Backups</a>
          <a href="#snapshots">Snapshots</a>
          <a href="#networking">Networking</a>
          <a href="#firewalls">Firewalls</a>
          <a href="#volumes">Volumes</a>
          <a href="#power">Power</a>
          <a href="#rescue">Rescue</a>
          <a href="#iso-images">ISO Images</a>
        </nav>
      </header>
      <section className="server-specifications">
        <div className="spec-item">
          <div className="spec-icon-value">
            <FontAwesomeIcon icon={faMicrochip} className="spec-icon" />
            <span className="spec-value">2</span>
          </div>
          <div className="spec-label">VCPU</div>
        </div>
        <div className="spec-item">
          <div className="spec-icon-value">
            <FontAwesomeIcon icon={faMemory} className="spec-icon" />
            <span className="spec-value">4 GB</span>
          </div>
          <div className="spec-label">RAM</div>
        </div>
        <div className="spec-item">
          <div className="spec-icon-value">
            <FontAwesomeIcon icon={faHdd} className="spec-icon" />
            <span className="spec-value">40 GB</span>
          </div>
          <div className="spec-label">DISK LOCAL</div>
        </div>
        <div className="spec-item">
          <div className="spec-icon-value">
            <FontAwesomeIcon icon={faChartLine} className="spec-icon" />
            <span className="spec-value">0.35</span>
          </div>
          <div className="spec-label">USAGE</div>
        </div>
        <div className="spec-item">
          <div className="spec-icon-value">
            <FontAwesomeIcon icon={faNetworkWired} className="spec-icon" />
            <span className="spec-value">0/20 TB</span>
          </div>
          <div className="spec-label">TRAFFIC OUT</div>
        </div>
        <div className="spec-item">
          <div className="spec-icon-value">
            <FontAwesomeIcon icon={faEuroSign} className="spec-icon" />
            <span className="spec-value">3.29/mo</span>
          </div>
          <div className="spec-label">PRICE</div>
        </div>
      </section>
      <section className="server-location">
        <h2>
          <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" /> Location
        </h2>
        <div className="location-details">
          <div className="location-item">
            <div className="location-label">DATACENTER</div>
            <div className="location-value">fsn1-dc14</div>
          </div>
          <div className="location-item">
            <div className="location-label">CITY</div>
            <div className="location-value">Falkenstein</div>
          </div>
          <div className="location-item">
            <div className="location-label">COUNTRY</div>
            <div className="location-value">Germany</div>
          </div>
          <div className="location-item">
            <div className="location-label">NETWORK ZONE</div>
            <div className="location-value">eu-central</div>
          </div>
        </div>
        <div className="location-maps">
          <MapComponent
            center={[50.477, 12.3705]}
            zoom={13}
            markerPosition={[50.477, 12.3705]}
            popupText="Server Location: Falkenstein, Germany"
          />
        </div>
      </section>
      <section className="server-options">
        <h2>
          <FontAwesomeIcon icon={faCogs} className="icon" /> Options
        </h2>
        <div className="option-item">
          <div className="option-icon-button">
            <FontAwesomeIcon icon={faDatabase} className="icon" />
            <button className="btn">Enable</button>
          </div>
          <div className="option-label">Backups</div>
        </div>
        <div className="option-item">
          <div className="option-icon-button">
            <FontAwesomeIcon icon={faLayerGroup} className="icon" />
            <button className="btn">Select Group</button>
          </div>
          <div className="option-label">Placement Group</div>
        </div>
        <div className="option-item">
          <div className="option-icon-button">
            <FontAwesomeIcon icon={faPublicNetwork} className="icon" />
            <button className="btn">Disabled</button>
          </div>
          <div className="option-label">Public Network</div>
        </div>
      </section>
      <section className="server-activities">
        <h2>
          <FontAwesomeIcon icon={faTasks} className="icon" /> Activities
        </h2>
        <ul>
          {activities.map((activity, index) => (
            <li key={index}>
              <div className="activity-description">{activity.description}</div>
              <div className="activity-timestamp">{activity.timestamp}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ServerDetails;
