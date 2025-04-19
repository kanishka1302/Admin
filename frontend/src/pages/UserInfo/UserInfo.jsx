import React, { useEffect, useState, useContext } from "react";
import "./UserInfo.css";
import { StoreContext } from "../../Context/StoreContext"; // adjust path if needed

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    address: "",
  });

  const { walletBalance, fetchWalletDetails } = useContext(StoreContext);

  // ✅ Load User Data from Local Storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(parsedUser);
    }
  }, []);

  // ✅ Automatically Update Address When Changed From Navbar
  useEffect(() => {
    if (user && user.address !== formData.address) {
      setFormData((prevData) => ({
        ...prevData,
        address: user.address,
      }));
    }
  }, [user]);

  // ✅ Fetch wallet details when user is loaded
  useEffect(() => {
    if (user) {
      fetchWalletDetails();
    }
  }, [user, fetchWalletDetails]);

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

  if (!user) {
    return (
      <div className="userinfo">
        <h1>User Information</h1>
        <p>No user data found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="userinfo">
      <h1>User Information</h1>

      {successMessage && <p className="success-message">{successMessage}</p>}

      <p>
        <strong>Name:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        ) : (
          user.name
        )}
      </p>

      <p>
        <strong>Email ID:</strong>{" "}
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        ) : (
          user.email
        )}
      </p>

      <p>
        <strong>Mobile No:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            name="mobileNumber"
            maxLength="10"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
        ) : (
          user.mobileNumber
        )}
      </p>

      <p>
        <strong>Address:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        ) : (
          user.address || "Not provided"
        )}
      </p>

      <p>
        <strong>Wallet Balance:</strong> ₹{walletBalance.toFixed(2)}
      </p>

      {isEditing ? (
        <button className="save-button" onClick={handleSaveClick}>
          Save
        </button>
      ) : (
        <button className="edit-button" onClick={handleEditClick}>
          Edit Information
        </button>
      )}
    </div>
  );
};

export default UserInfo;
