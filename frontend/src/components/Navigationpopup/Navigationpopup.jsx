import React, { useState } from 'react';
import './NavigationPopup.css';

const NavigationPopup = ({ onClose, onLocationSubmit }) => {
  const [pinCode, setPinCode] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullAddress, setFullAddress] = useState('');
  const [showFullAddress, setShowFullAddress] = useState(false);

  const handlePinCodeChange = (e) => {
    setPinCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinCode === '500089') { // Example pincode for testing
      onLocationSubmit('Manikonda, Telangana');
      setLocationMessage('');
      onClose();
    } else {
      setLocationMessage('Service not available at this location.');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // Timeout after 10 seconds
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const address = await fetchAddressFromCoordinates(latitude, longitude);
          if (address) {
            setFullAddress(address); // Set the full address
            onLocationSubmit(address); // Pass address up to parent (Navbar)
            setLocationMessage('');
            onClose(); // Close the popup after submitting the location
          } else {
            setLocationMessage('Unable to fetch your location.');
          }
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationMessage('Permission denied for geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationMessage('Position unavailable.');
              break;
            case error.TIMEOUT:
              setLocationMessage('Geolocation request timed out.');
              break;
            default:
              setLocationMessage('Unable to fetch location. Please try again.');
          }
        },
        options
      );
    } else {
      setLocationMessage('Geolocation is not supported by this browser.');
    }
  };

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        const street = address.road || address.pedestrian || 'Street not found';
        const area = address.suburb || address.neighbourhood || 'Area not found';
        const city = address.city || address.town || address.village || 'City not found';
        const state = address.state || 'State not found';
        const postcode = address.postcode || address.pincode || 'Pincode not found';
        const country = address.country || 'Country not found';

        const formattedAddress = `${street}, ${area}, ${city}, ${state}, ${postcode}, ${country}`;

        return formattedAddress; // Return the detailed address
      } else {
        throw new Error('Failed to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  const toggleAddressVisibility = () => {
    setShowFullAddress((prevState) => !prevState); // Toggle the visibility
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="close-mark" onClick={onClose}>
          &times;
        </span>
        <h2>Select Location</h2>
        <div className="location-options">
          <button
            onClick={getCurrentLocation}
            className="use-current-location"
            disabled={loading}
          >
            {loading ? 'Fetching location...' : 'Use My Current Location'}
          </button>
          <div className="divider">OR</div>
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
        </div>
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
