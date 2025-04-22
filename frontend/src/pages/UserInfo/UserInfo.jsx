import React, { useEffect, useState, useContext } from "react";
import "./UserInfo.css";
import { StoreContext } from "../../Context/StoreContext";

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
  });

  const { walletBalance, fetchWalletDetails } = useContext(StoreContext);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (user && user.address !== formData.address) {
      setFormData((prevData) => ({
        ...prevData,
        address: user.address,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWalletDetails();
    }
  }, [user, fetchWalletDetails]);

  useEffect(() => {
    const fetchAddresses = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const mobileNumber = storedUser?.mobileNumber;

      if (!mobileNumber) return;

      try {
        const res = await fetch(`http://localhost:5000/api/address/user/${mobileNumber}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setUserAddresses(data);
        } else {
          console.warn("Expected array of addresses, got:", data);
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    fetchAddresses();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleSaveClick = async () => {
    if (
      formData.name.trim() === "" ||
      formData.email.trim() === "" ||
      formData.mobileNumber.trim() === "" ||
      formData.address.trim() === ""
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
      ...formData,
    };

    setUser(updatedUser);
    setFormData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    try {
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
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

        <p><strong>Address:</strong>{" "}
          {isEditing ? (
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          ) : user.address || "Not provided"}
        </p>

        <p><strong>Wallet Balance:</strong> ₹{walletBalance.toFixed(2)}</p>

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
