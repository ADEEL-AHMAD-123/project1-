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
          <h3>SSH Key</h3>
          <div className="ssh-key">
            <h4>Public Key</h4>
            <div className="key-content">
              <pre>{User.sshKeys.publicKey}</pre>
              <button onClick={() => navigator.clipboard.writeText(User.sshKeys.publicKey)}>Copy</button>
            </div>
          </div>
        </div>
      )}
      <div className="ip-address">
        <h3>IP Address</h3>
        <div className="ip-content">
          <p>{User.lastLoginIp || "No IP address found"}</p>
          {User.lastLoginIp && (
            <button onClick={() => navigator.clipboard.writeText(User.lastLoginIp)}>Copy</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
