import React, { useState } from 'react';
import './Navigationpopup.css';

const NavigationPopup = ({ onClose, onLocationSubmit }) => {
  const [pinCode, setPinCode] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [showFullAddress, setShowFullAddress] = useState(false);

  const handlePinCodeChange = (e) => {
    setPinCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinCode === "500089") {
      onLocationSubmit("Manikonda, Telangana");
      setLocationMessage("");
      onClose();
    } else {
      setLocationMessage(
        <>
          ✨ We're not in your area yet, but we're growing! Currently, our
          service is available in{" "}
          <span className="highlight">Manikonda</span> and{" "}
          <span className="highlight">Narsingi</span>. Stay tuned for updates!
          🍽️
        </>
      );
    }
  };
  const toggleAddressVisibility = () => {
    setShowFullAddress((prevState) => !prevState);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="close-mark" onClick={onClose}>
          &times;
        </span>
        <h2>Select Location</h2>
       
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Pincode"
            value={pinCode}
            onChange={handlePinCodeChange}
            required
            className="pincode-input"
          />
          <button type="submit" className="otp-button">
            Submit
          </button>
        </form>

        {locationMessage && <p className="message">{locationMessage}</p>}

        {fullAddress && (
          <div className="address-container">
            <p>
              <strong>Address:</strong>
              {showFullAddress ? (
                <span>
                  {fullAddress}
                  <span
                    className="toggle-address"
                    onClick={toggleAddressVisibility}
                  >
                    {' '}
                    ^ Hide Full Address
                  </span>
                </span>
              ) : (
                <span>
                  {fullAddress.substring(0, 50)}...{' '}
                  <span
                    className="toggle-address"
                    onClick={toggleAddressVisibility}
                  >
                    {' '}
                    ^ Show Full Address
                  </span>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationPopup;
