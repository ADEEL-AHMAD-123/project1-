import React from 'react';
import "../styles/AccountDetails.scss";

const AccountDetails = ({ User }) => {
  if (!User) {
    return <p>No user data found</p>;
  }

  // Check if User has SSH keys and public key is present
  const hasSSHKeys = User.sshKeys && User.sshKeys.publicKey;

  return (
    <div className="account-details">
      {hasSSHKeys && (
        <div className="ssh-keys">
          <h3>Public SSH Key</h3>
          <div className="ssh-key">
            <div className="key-content">
              <pre>{User.sshKeys.publicKey}</pre>
              <button onClick={() => navigator.clipboard.writeText(User.sshKeys.publicKey)} className="btn" 
              >Copy</button>
            </div>
          </div>
        </div>
      )}
      {
        <div className="ssh-keys">
          <h3>IP Address </h3>
          <div className="ssh-key">
            <div className="key-content">
              <pre>{User.lastLoginIp}</pre>
              <button onClick={() => navigator.clipboard.writeText(User.lastLoginIp)} className="btn">Copy</button>
            </div>
          </div>
        </div>
      }
      
    </div>
  );
};

export default AccountDetails;
