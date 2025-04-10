import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../Map/Map"; // Import Map.jsx
import "./DeliveryAddress.css";

const DeliveryAddress = ({ onSelectAddress }) => {
  const navigate = useNavigate();  

  // Load saved addresses and selected address from local storage
  const [addresses, setAddresses] = useState(() => {
    const savedAddresses = localStorage.getItem("savedAddresses");
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    const storedSelected = localStorage.getItem("selectedAddress");
    return storedSelected ? JSON.parse(storedSelected) : null;
  });

  const [showForm, setShowForm] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false); // Map popup state

  // New address state
  const [newAddress, setNewAddress] = useState({
    name: "",
    mobileNumber: "",
    type: "Home",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedAddresses", JSON.stringify(addresses));
  }, [addresses]);

  // Handle adding or updating an address
  const handleAddOrUpdateAddress = () => {
    const { name, mobileNumber, address, city, state, pincode } = newAddress;

    if (name && mobileNumber && address && city && state && pincode) {
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      setShowForm(false);
      setNewAddress({
        name: "",
        mobileNumber: "",
        type: "Home",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });

      // Auto-select the newly added address
      handleSelectAddress(newAddress);
    } else {
      // Simple validation feedback
      alert("Please fill in all required fields");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open map popup for live location
  const handleUseLiveLocation = () => {
    setShowMapPopup(true);
  };

  // Receive selected location from Map.jsx and update address fields
  const handleLocationSelect = (locationData) => {
    if (locationData) {
      setNewAddress((prev) => ({
        ...prev,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        pincode: locationData.pincode,
      }));
      setShowMapPopup(false);
    }
  };

  // Select an address for delivery
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    localStorage.setItem("selectedAddress", JSON.stringify(address));

    if (onSelectAddress) {
      // Split name for PlaceOrder
      const nameParts = address.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Send structured data to PlaceOrder
      onSelectAddress({ ...address, firstName, lastName });
    }
  };

  // Delete an address
  const handleDeleteAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);

    // If the deleted address was selected, clear selection
    if (selectedAddress && addresses[index] && selectedAddress.pincode === addresses[index].pincode) {
      setSelectedAddress(null);
      localStorage.removeItem("selectedAddress");
    }
  };

  return (
    <div className="delivery-address">
      <h2>SELECT DELIVERY ADDRESS</h2>

      <div className="address-container">
        {addresses.map((addr, index) => (
          <div key={index} className="address-wrapper">
            <input
              type="radio"
              name="selectedAddress"
              className="radio-left"
              checked={selectedAddress && selectedAddress.pincode === addr.pincode}
              onChange={() => handleSelectAddress(addr)}
            />
            <div className="address-card">
              <h4>{addr.type}</h4>
              <p><strong>Name:</strong> {addr.name}</p>
              <p><strong>Mobile:</strong> {addr.mobileNumber}</p>
              <p>{addr.address}, {addr.city}, {addr.state}, {addr.pincode}, {addr.country}</p>
              <div className="address-actions">
                <button onClick={() => handleSelectAddress(addr)}>DELIVER HERE</button>
                <button className="delete-btn" onClick={() => handleDeleteAddress(index)}>DELETE</button>
              </div>
            </div>
          </div>
        ))}

        <div className="address-card add-new" onClick={() => setShowForm(true)}> 
          <h4>Add New Address</h4>
          <p>Click here to add new address</p>
          <button>ADD NEW</button>
        </div>
      </div>

      {showForm && (
        <div className="address-form">
          <h4>Add New Address</h4>

          <div>
            <label>
              <input 
                type="radio" 
                name="type" 
                value="Home" 
                checked={newAddress.type === "Home"} 
                onChange={handleInputChange} 
              /> 
              Home
            </label>
            <label>
              <input 
                type="radio" 
                name="type" 
                value="Office" 
                checked={newAddress.type === "Office"} 
                onChange={handleInputChange} 
              /> 
              Office
            </label>
            <label>
              <input 
                type="radio"
                name="type" 
                value="Others" 
                checked={newAddress.type === "Others"} 
                onChange={handleInputChange} 
              /> 
              Others
            </label>
          </div>

          <input 
            type="text" 
            name="name" 
            placeholder="Full Name" 
            value={newAddress.name} 
            onChange={handleInputChange} 
          />
          <input 
            type="text" 
            name="mobileNumber" 
            placeholder="Mobile Number" 
            maxLength="10" 
            value={newAddress.mobileNumber} 
            onChange={handleInputChange} 
          />
          <input 
            type="text" 
            name="address" 
            placeholder="Address" 
            value={newAddress.address} 
            onChange={handleInputChange} 
          />
          <input 
            type="text" 
            name="city" 
            placeholder="City" 
            value={newAddress.city} 
            onChange={handleInputChange} 
          />
          <input 
            type="text" 
            name="state" 
            placeholder="State" 
            value={newAddress.state} 
            onChange={handleInputChange} 
          />
          <input 
            type="text" 
            name="pincode" 
            placeholder="Pincode" 
            maxLength="6" 
            value={newAddress.pincode} 
            onChange={handleInputChange} 
          />

          <button onClick={handleAddOrUpdateAddress}>SAVE ADDRESS</button>
          <button onClick={() => setShowForm(false)}>CANCEL</button>
          <button onClick={handleUseLiveLocation}>USE LIVE LOCATION</button>
        </div>
      )}

      {showMapPopup && (
        <div className="map-popup">
          <div className="map-popup-content">
            <h3>Pick Your Location</h3>
            <div className="map-container">
              <Map onSelectLocation={handleLocationSelect} /> {/* Map component with container */}
            </div>
            <button onClick={() => setShowMapPopup(false)}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddress;
