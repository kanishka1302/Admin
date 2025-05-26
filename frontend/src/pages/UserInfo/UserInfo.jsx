import React, { useEffect, useState, useContext } from "react";
import "./UserInfo.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userAddresses, setUserAddresses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "", // Added fields for address
  });

  // State for storing the credited amount
  const [creditedAmount, setCreditedAmount] = useState(null);

  // Get user data from localStorage
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).userId : null; // Extract userId from localStorage

  const { walletBalance, setUserId, fetchWalletBalance } = useContext(StoreContext);
  const firstSavedAddress = userAddresses[0];  // This will always give the first address

  // Fetch user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        name: parsedUser.name ?? "",
        email: parsedUser.email ?? "",
        mobileNumber: parsedUser.mobileNumber ?? "",
        address: parsedUser.address ?? "",
        city: parsedUser.city ?? "",
        state: parsedUser.state ?? "",
        pincode: parsedUser.pincode ?? "",
        country: parsedUser.country ?? "", // Initialize country field
      }));
    }
  }, []);

  // Fetch user addresses from the API
  useEffect(() => {
    const fetchAddresses = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const mobileNumber = storedUser?.mobileNumber;

      if (!mobileNumber) return;

      try {
        const res = await fetch(`https://admin-92vt.onrender.com/api/address/user/${mobileNumber}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setUserAddresses(data);

          // Also set the first address into formData if not already set
          if (data.length > 0 && !formData.address) {
            setFormData((prev) => ({
              ...prev,
              address: data[0].address || "",
              city: data[0].city || "",
              state: data[0].state || "",
              pincode: data[0].pincode || "",
              country: data[0].country || "India", // Set default country
            }));
          }
        }

      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    fetchAddresses();
  }, []);

  // Fetch credited amount for the user
  useEffect(() => {
    const fetchCreditedAmount = async () => {
      if (user && user.email) {
        try {
          const response = await axios.get(`https://admin-92vt.onrender.com/api/history/user/${user.email}`);
          const creditedAmount = response.data.creditedAmount;
          setCreditedAmount(typeof creditedAmount === "number" ? creditedAmount : 0);
        } catch (err) {
          console.error("Error fetching credited amount:", err);
          setCreditedAmount(0); // Fallback value in case of an error
        }
      }
    };

    fetchCreditedAmount();
  }, [user]);

  const defaultAddress = userAddresses.find(addr => addr.default);

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleSaveClick = async () => {
    console.log("formData before save:", formData);

    if (
      (formData.name ?? "").trim() === "" ||
      (formData.email ?? "").trim() === "" ||
      (formData.mobileNumber ?? "").trim() === "" ||
      (formData.address ?? "").trim() === "" ||
      (formData.city ?? "").trim() === "" ||
      (formData.state ?? "").trim() === "" ||
      (formData.pincode ?? "").trim() === "" ||
      (formData.country ?? "").trim() === ""
    ) {
      alert("Please fill out all fields before saving.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      alert("Mobile number must be 10 digits.");
      return;
    }

    const updatedUser = {
      ...user,
      userId: user._id,
      ...formData,
    };

    setUser(updatedUser);
    setFormData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`https://admin-92vt.onrender.com/api/profile/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Your information has been successfully updated.");
      } else {
        alert("Failed to update user data in the database.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating user data.");
    }
     // ✅ Also update the address in Address collection
  if (firstSavedAddress?._id) {
    try {
      console.log("Attempting to update address with ID:", firstSavedAddress._id);
      const res = await fetch(`https://admin-92vt.onrender.com/api/address/${firstSavedAddress._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update address.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
    }
  }

  // ✅ Optionally re-fetch updated address
  const fetchAddresses = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const mobileNumber = storedUser?.mobileNumber;

    if (!mobileNumber) return;

    try {
      const res = await fetch(`https://admin-92vt.onrender.com/api/address/user/${mobileNumber}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserAddresses(data);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  await fetchAddresses(); // Refresh updated address list

    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const scrollCarousel = (direction) => {
    const carousel = document.getElementById("address-carousel");
    const card = carousel.querySelector(".address-card");
    if (!card) return;
    const scrollAmount = card.offsetWidth + 20;

    if (carousel) {
      if (direction === "left") {
        carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (!user) {
    return (
      <div className="userinfo">
        <h1>User Information</h1>
        <p>No user data found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="userinfo-container">
      {/* Left side: User Info */}
      <div className="userinfo-section">
        <h1>User Information</h1>
        {successMessage && <p className="success-message">{successMessage}</p>}

        <p><strong>Name:</strong>{" "}
          {isEditing ? (
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          ) : user.name}
        </p>

        <p><strong>Email ID:</strong>{" "}
          {isEditing ? (
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          ) : user.email}
        </p>

        <p><strong>Mobile No:</strong>{" "}
          {isEditing ? (
            <input type="text" name="mobileNumber" maxLength="10" value={formData.mobileNumber} onChange={handleChange} />
          ) : user.mobileNumber}
        </p>
        <p><strong>Wallet Balance:</strong>₹{creditedAmount !== null && creditedAmount !== undefined ? creditedAmount.toFixed(2) : "Loading..."}</p>
      <div>
      <p className="address"><strong>Address:</strong> 
          {isEditing ? (
            <>
              <input className="text"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pin code"
              />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </>
          ) : (
            <>
              <p>{formData.address}</p>
              <p>{formData.city}</p>
              <p>{formData.state}</p>
              <p>{formData.pincode}</p>
              <p>{formData.country || "India"}</p>
            </>
          )}
        </p>
      </div>
        
        

        
        {isEditing ? (
          <button className="save-button" onClick={handleSaveClick}>Save</button>
        ) : (
          <button className="edit-button" onClick={handleEditClick}>Edit Information</button>
        )}
      </div>

      {/* Right side: Saved Addresses */}
      <div className="address-section">
        <h2 className="section-heading">Saved Addresses</h2>

        {userAddresses.length > 0 ? (
          <div className="address-carousel-wrapper">
            <button className="arrow-btn left" onClick={() => scrollCarousel("left")}>&#10094;</button>

            <div className="address-carousel" id="address-carousel">
              {userAddresses.map((addr, index) => (
                <div key={addr._id || index} className="address-card">
                  <p className="type"><strong>Type:</strong> {addr.type || "N/A"}</p>
                  <p><strong>Name:</strong> {addr.name}</p>
                  <p><strong>Mobile:</strong> {addr.mobileNumber}</p>
                  <p><strong>Address:</strong> {addr.address}</p>
                  <p><strong>City:</strong> {addr.city}</p>
                  <p><strong>State:</strong> {addr.state}</p>
                  <p><strong>Pin Code:</strong> {addr.pincode}</p>
                  <p><strong>Country:</strong> {addr.country || "India"}</p>
                </div>
              ))}
            </div>

            <button className="arrow-btn right" onClick={() => scrollCarousel("right")}>&#10095;</button>
          </div>
        ) : (
          <p>No saved addresses found.</p>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
