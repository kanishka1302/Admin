import { useContext, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import axios from "axios";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext.jsx";
import { auth } from "../../firebase";
import RegisterPopup from "../Registerpopup/Registerpopup.jsx";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currState] = useState("Login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);

  const requestOtp = async () => {
    if (phoneNumber.length !== 10) {
      toast.success("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("Recaptcha solved"),
      });

      const confirmationResult = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, window.recaptchaVerifier);
      
      setVerificationId(confirmationResult.verificationId);
      toast.success("OTP sent successfully!");

      // Ensure the URL is correct
      await axios.post("http://localhost:5000/api/login/create", {
        phoneNumber,
        verificationId: confirmationResult.verificationId,
      });

    } catch (error) {
      console.error("OTP Request Error:", error);
      toast.success("Failed to send OTP: " + error.message);
    }
  };

  const verifyOtp = async () => {
    if (!verificationId) {
      toast.success("OTP session expired. Please request OTP again.");
      return;
    }
  
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
  
      if (result.user) {
        toast.success("Phone number verified successfully");
  
        // Fetch user details from database
        const response = await axios.post("http://localhost:5000/api/profile/check", {
          mobileNumber: phoneNumber,
        });
  
        console.log("Server Response:", response.data);
  
        if (response.data.exists) {
          // Save user details in localStorage
          localStorage.setItem("user", JSON.stringify(response.data.profile));
  
          // Set authentication token
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
  
          // Close login popup
          setShowLogin(false);
  
          // Redirect to home page or profile page if needed
          window.location.href = "";
        } else {
          // User is not registered, show the registration popup
          setIsRegisterPopupOpen(true);
        }
      } else {
        throw new Error("OTP verification failed. Invalid user.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.success("OTP verification failed ");
    }
  };
  
  const handleRegisterClose = () => {
    setIsRegisterPopupOpen(false);
    setShowLogin(false);
  };

  return (
    <>
      <div className="login-popup">
        <form className="login-popup-container">
          <div className="login-popup-title">
            <h2>{currState}</h2>
            <img
              onClick={() => setShowLogin(false)}
              src={assets.crossicon}
              alt="Close"
            />
          </div>

          <div className="login-popup-inputs">
            <input
              name="phoneNumber"
              type="text"
              placeholder="Enter your mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <div id="recaptcha-container"></div>
            <button type="button" onClick={requestOtp}>
              Send OTP
            </button>

            {verificationId && (
              <div>
                <input
                  name="otp"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  placeholder="Enter OTP"
                  required
                />
                <button type="button" onClick={verifyOtp}>
                  Verify OTP
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {isRegisterPopupOpen && (
        <RegisterPopup
          isOpen={isRegisterPopupOpen}
          onClose={handleRegisterClose}
        />
      )}
    </>
  );
};

export default LoginPopup;
