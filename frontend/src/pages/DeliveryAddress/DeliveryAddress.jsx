import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import Map from "../Map/Map";
import "./DeliveryAddress.css";

const DeliveryAddress = ({ onSelectAddress }) => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [userId, setUserId] = useState(null);
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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const mobileNumber = storedUser?.mobileNumber;
  
    if (mobileNumber) {
      // Set userId directly from storedUser if available
      setUserId(storedUser._id || null);
  
      // ✅ Fetch addresses independently
      axios.get(`https://admin-92vt.onrender.com/api/address/user/${mobileNumber}`)
        .then((res) => {
          console.log("✅ Fetched addresses:", res.data);
          setAddresses(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
          console.error("❌ Error fetching addresses:", err);
        });
    }
  }, []);
  useEffect(() => {
    const storedSelected = localStorage.getItem("selectedAddress");
    setSelectedAddress(storedSelected ? JSON.parse(storedSelected) : null);
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      setNewAddress(selectedAddress);
    }
  }, [selectedAddress]);

  const handleAddOrUpdateAddress = async () => {
    const { name, mobileNumber, address, city, state, pincode } = newAddress;
  
    if (name && mobileNumber && address && city && state && pincode) {
      try {
        const sanitizedAddress = { ...newAddress };
        if (!editIndex && sanitizedAddress._id) {
          delete sanitizedAddress._id; // avoid duplicate _id
        }
  
        // 📌 Use the login mobile number as the owner
        const loginMobile = JSON.parse(localStorage.getItem("user"))?.mobileNumber;
  
        const response = await axios.post("https://admin-92vt.onrender.com/api/address/save", {
          ownerId: userId,
          contactAddress: {
            ...sanitizedAddress,
            ownerMobile: loginMobile,
          }, 
        });
  
        const saved = response.data.address;
  
        const updatedAddresses = [...addresses];
        if (editIndex !== null) {
          updatedAddresses[editIndex] = saved;
  
          if (selectedAddress?.pincode === addresses[editIndex].pincode) {
            setSelectedAddress(saved);
            localStorage.setItem("selectedAddress", JSON.stringify(saved));
          }
        } else {
          updatedAddresses.push(saved);
        }
  
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
      } catch (err) {
        console.error("❌ Failed to save address:", err);
        alert("Something went wrong while saving the address.");
      }
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

  const handleUseLiveLocation = () => {
    setShowMapPopup(true);
  };

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

  const handleDeleteAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);

    if (selectedAddress && addresses[index]?._id === selectedAddress._id) {
      setSelectedAddress(null);
      localStorage.removeItem("selectedAddress");
    }

    // Optional: Delete from backend (not implemented in your backend yet)
  };

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
                //checked={selectedAddress?._id === addr._id}
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
            <label><input type="radio" name="type" value="Home" checked={newAddress.type === "Home"} onChange={handleInputChange} /> Home</label>
            <label><input type="radio" name="type" value="Office" checked={newAddress.type === "Office"} onChange={handleInputChange} /> Office</label>
            <label><input type="radio" name="type" value="Others" checked={newAddress.type === "Others"} onChange={handleInputChange} /> Others</label>
          </div>

          <input type="text" name="name" placeholder="Full Name" value={newAddress.name} onChange={handleInputChange} />
          <input type="text" name="mobileNumber" placeholder="Mobile Number" maxLength="10" value={newAddress.mobileNumber} onChange={handleInputChange} />
          <input type="text" name="address" placeholder="Address" value={newAddress.address} onChange={handleInputChange} />
          <input type="text" name="city" placeholder="City" value={newAddress.city} onChange={handleInputChange} />
          <input type="text" name="state" placeholder="State" value={newAddress.state} onChange={handleInputChange} />
          <input type="text" name="pincode" placeholder="Pincode" maxLength="6" value={newAddress.pincode} onChange={handleInputChange} />

          <button onClick={handleAddOrUpdateAddress}>{editIndex !== null ? "Update Address" : "Save Address"}</button>
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
