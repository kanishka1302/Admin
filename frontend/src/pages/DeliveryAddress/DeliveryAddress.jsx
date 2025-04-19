import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import Map from "../Map/Map"; // Assuming you have a Map component for location selection
import "./DeliveryAddress.css";

const DeliveryAddress = ({ onSelectAddress }) => {
  const navigate = useNavigate();

  // State to manage saved addresses in localStorage
  const [addresses, setAddresses] = useState(() => {
    const savedAddresses = localStorage.getItem("savedAddresses");
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  });

  const [selectedAddress, setSelectedAddress] = useState(null);  // Default to null

  // Load the selected address from localStorage (if any) when the component mounts
  useEffect(() => {
    const storedSelected = localStorage.getItem("selectedAddress");
    setSelectedAddress(storedSelected ? JSON.parse(storedSelected) : null);
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

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
    // Don't auto-select any address when component mounts
    setSelectedAddress(null);
  }, []);

  // Prefill form with selectedAddress if exists
  useEffect(() => {
    if (selectedAddress) {
      setNewAddress(selectedAddress);
    }
  }, [selectedAddress]);

  // Handle adding or updating address
  const handleAddOrUpdateAddress = () => {
    const { name, mobileNumber, address, city, state, pincode } = newAddress;
  
    if (name && mobileNumber && address && city && state && pincode) {
      let updatedAddresses = [...addresses];
  
      if (editIndex !== null) {
        // Update existing address
        updatedAddresses[editIndex] = newAddress;
  
        // If the address being edited is currently selected, update selectedAddress too
        if (selectedAddress?.pincode === addresses[editIndex].pincode) {
          setSelectedAddress(newAddress);
          localStorage.setItem("selectedAddress", JSON.stringify(newAddress));
        }
      } else {
        // Add new address without selecting it
        updatedAddresses.push(newAddress);
        // No change to selectedAddress here
      }
  
      // Update addresses and reset form
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
      setEditIndex(null);
    } else {
      alert("Please fill in all required fields");
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle using live location (assuming Map component returns location data)
  const handleUseLiveLocation = () => {
    setShowMapPopup(true);
  };

  // Handle location selection from the map
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

  // Select an address to be used for the order
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    localStorage.setItem("selectedAddress", JSON.stringify(address));

    if (onSelectAddress) {
      const nameParts = address.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      onSelectAddress({ ...address, firstName, lastName });
    }
  };

  // Delete an address from the list
  const handleDeleteAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);

    // If the selected address is deleted, clear it
    if (selectedAddress && addresses[index] && selectedAddress.pincode === addresses[index].pincode) {
      setSelectedAddress(null);
      localStorage.removeItem("selectedAddress");
    }
  };

  // Edit an existing address
  const handleEditAddress = (index) => {
    setEditIndex(index);
    setNewAddress(addresses[index]);
    setShowForm(true);
  };

  return (
    <div className="delivery-address">
      <h2>Select Delivery Address</h2>

      <div className="address-container">
        {addresses.length > 0 ? (
          addresses.map((addr, index) => (
            <div key={index} className="address-wrapper">
              <input
                type="radio"
                name="selectedAddress"
                className="radio-left"
                checked={selectedAddress?.pincode === addr.pincode}
                onChange={() => handleSelectAddress(addr)}
              />
              <div className="address-card">
                <h4>{addr.type}</h4>
                <p><strong>Name:</strong> {addr.name}</p>
                <p><strong>Mobile:</strong> {addr.mobileNumber}</p>
                <p>{addr.address}, {addr.city}, {addr.state}, {addr.pincode}, {addr.country}</p>
                <div className="address-actions">
                  <button className="edit-btn" onClick={() => handleEditAddress(index)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteAddress(index)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No addresses available. Please add one.</p>
        )}
        <div className="address-card add-new" onClick={() => setShowForm(true)}>
          <h4>Add New Address</h4>
          <p>Click here to add new address</p>
          <button>Add New</button>
        </div>
      </div>

      {showForm && (
        <div className="address-form">
          <h4>{editIndex !== null ? "Edit Address" : "Add New Address"}</h4>

          <div>
            <label>
              <input type="radio" name="type" value="Home"  checked={newAddress.type === "Home"} onChange={handleInputChange} />
              Home
            </label>
            <label>
              <input type="radio" name="type" value="Office"  checked={newAddress.type === "Office"} onChange={handleInputChange} />
              Office
            </label>
            <label>
              <input type="radio" name="type" value="Others" checked={newAddress.type === "Others"} onChange={handleInputChange} />
              Others
            </label>
          </div>

          <input type="text" name="name" placeholder="Full Name" value={newAddress.name} onChange={handleInputChange} />
          <input type="text" name="mobileNumber" placeholder="Mobile Number" maxLength="10" value={newAddress.mobileNumber} onChange={handleInputChange} />
          <input type="text" name="address" placeholder="Address" value={newAddress.address} onChange={handleInputChange} />
          <input type="text" name="city" placeholder="City" value={newAddress.city} onChange={handleInputChange} />
          <input type="text" name="state" placeholder="State" value={newAddress.state} onChange={handleInputChange} />
          <input type="text" name="pincode" placeholder="Pincode" maxLength="6" value={newAddress.pincode} onChange={handleInputChange} />

          <button onClick={handleAddOrUpdateAddress}>
            {editIndex !== null ? "Update Address" : "Save Address"}
          </button>
          <button onClick={() => { setShowForm(false); setEditIndex(null); }}>Cancel</button>
          <button onClick={handleUseLiveLocation}>Use Live Location</button>
        </div>
      )}

      {showMapPopup && (
        <div className="map-popup">
          <div className="map-popup-content">
            <h3>Pick Your Location</h3>
            <div className="map-container">
              <Map onSelectLocation={handleLocationSelect} />
            </div>
            <button onClick={() => setShowMapPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddress;
