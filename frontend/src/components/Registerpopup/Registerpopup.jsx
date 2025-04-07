import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./RegisterPopup.css";

const RegisterPopup = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
  });

  const { setUser } = useContext(StoreContext); // Get setUser function from context

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = () => {
    // Simulate registration logic
    console.log("User Data:", formData);

    // Perform registration validation
    if (!formData.name || !formData.email || !formData.mobileNumber) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Store the user data in the context
    setUser(formData); // Save user data in context

    toast.success("User registered successfully!");

    // Close the popup
    onClose();
    onRegisterSuccess(); // Call success callback
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
