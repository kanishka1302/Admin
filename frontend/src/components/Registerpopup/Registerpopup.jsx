import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Registerpopup.css";

const RegisterPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
  });

  const [verifiedNumber, setVerifiedNumber] = useState("");

  useEffect(() => {
    // Retrieve the verified phone number from localStorage
    const storedNumber = localStorage.getItem("verifiedPhoneNumber");
    if (storedNumber) {
      setVerifiedNumber(storedNumber);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.mobileNumber) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      // Backend API call
      const response = await fetch("https://admin-92vt.onrender.com/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "User registered successfully!");

        // Save user data in localStorage
        localStorage.setItem("user", JSON.stringify(formData));

        // Clear the form
        setFormData({ name: "", email: "", mobileNumber: "" });

        // Close the popup
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Registration failed.");
      }
    } catch (error) {
      toast.error("An error occurred while registering.");
    }
  };

  return (
    <>
      <ToastContainer />
      {isOpen && (
        <div className="register-popup">
          <div className="register-popup-container">
            <h2>Register</h2>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email ID"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
            
            <div className="register-popup-actions">
              <button className="register-btn" onClick={handleRegister}>
                Register
              </button>
              <button className="close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterPopup;
