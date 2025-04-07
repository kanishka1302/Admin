/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types'; // For prop validation
import { StoreContext } from '../../Context/StoreContext.jsx';
import './Verify.css';
import RegisterPopup from '../../components/RegisterPopup/Registerpopup.jsx'; // Corrected import path

const Verify = ({ onLoginSuccess }) => {
  const { url } = useContext(StoreContext); // Get the API base URL from context
  const [searchParams] = useSearchParams(); // Get query parameters
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const [otp, setOtp] = useState(''); // OTP input state
  const [errorMessage, setErrorMessage] = useState(''); // Error state for OTP
  const [showRegisterPopup, setShowRegisterPopup] = useState(false); // State for showing RegisterPopup
  const navigate = useNavigate(); // Initialize the navigation hook

  // Function to handle OTP submission
  const handleOtpSubmit = () => {
    if (otp === '1234') {
      setShowRegisterPopup(true); // Show the RegisterPopup on successful OTP
    } else {
      setErrorMessage('Invalid OTP!'); // Show an error message
    }
  };

  // Function to verify payment
  const verifyPayment = async () => {
    try {
      const response = await axios.post(`${url}/api/order/verify`, { success, orderId });
      if (response.data.success) {
        navigate('/myorders'); // Redirect to My Orders if payment is successful
      } else {
        navigate('/'); // Redirect to Home on failure
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  // Automatically verify payment on component mount
  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="verify">
      {showRegisterPopup ? (
        <RegisterPopup onClose={() => setShowRegisterPopup(false)} />
      ) : (
        <>
          <div className="spinner"></div>

          {/* OTP Verification Section */}
          <div className="verify-otp">
            <h2>Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <button onClick={handleOtpSubmit}>Verify OTP</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
        </>
      )}
    </div>
  );
};

// PropTypes validation
Verify.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};

export default Verify;