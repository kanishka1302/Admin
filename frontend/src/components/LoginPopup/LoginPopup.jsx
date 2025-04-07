import { useContext, useState, useEffect } from "react";
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
import RegisterPopup from "../RegisterPopup/Registerpopup.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

  const [currState] = useState("Login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const testCredentials = {
    phone: "1234567890",
    email: "testuser@example.com",
    password: "testpassword123",
    name: "Test User",
  };

  // Check for token on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setShowLogin(false); // Automatically close the login popup if logged in
    }
  }, [setToken, setShowLogin]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const requestOtp = async () => {
    if (phoneNumber === testCredentials.phone) {
      setVerificationId("test-verification-id");
      setOtp("123456");
      toast.success("Test OTP auto-filled!");
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha solved");
        },
      });

      const confirmationResult = await signInWithPhoneNumber(
        auth,
       `+91${phoneNumber}`,
        window.recaptchaVerifier
      );

      setVerificationId(confirmationResult.verificationId);
      toast.success("OTP sent!");
    } catch (error) {
      console.error("OTP Request Error:", error);
      toast.error("Failed to send OTP: " + error.message);
    }
  };

  const verifyOtp = async () => {
    if (phoneNumber === testCredentials.phone && otp === "123456") {
      toast.success("Test OTP verified successfully!");
      setToken("test-user-token");
      localStorage.setItem("token", "test-user-token");
      setIsRegisterPopupOpen(true);
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);

      toast.success("Phone number verified successfully!");
      setToken(result.user.uid);
      localStorage.setItem("token", result.user.uid); // Save token to localStorage
      setIsRegisterPopupOpen(true);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error("OTP verification failed: " + error.message);
    }
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = url;

    if (
      (currState === "Login" &&
        data.email === testCredentials.email &&
        data.password === testCredentials.password) ||
      (currState === "Login" && phoneNumber === testCredentials.phone)
    ) {
      setToken("test-user-token");
      localStorage.setItem("token", "test-user-token"); // Save token to localStorage
      toast.success("Login successful!");
      setShowLogin(false);
      return;
    }

    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token); // Save token to localStorage
        toast.success("Login successful!");
        setShowLogin(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Login failed: " + error.message);
    }
  };

  const handleRegisterClose = () => {
    setIsRegisterPopupOpen(false);
    setShowLogin(false); // Close the login popup as well
  };

  return (
    <>
      <div className="login-popup">
        <form onSubmit={onLogin} className="login-popup-container">
          <div className="login-popup-title">
            <h2>{currState}</h2>
            <img
              onClick={() => setShowLogin(false)}
              src={assets.crossicon}
              alt="Close"
            />
          </div>

          <div className="login-popup-inputs">
            {currState === "Login" ? (
              <>
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
              </>
            ) : (
              <>
                <input
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  placeholder="Your Name"
                  required
                />
                <input
                  name="email"
                  onChange={onChangeHandler}
                  value={data.email}
                  type="email"
                  placeholder="Your Email"
                  required
                />
                <input
                  name="password"
                  onChange={onChangeHandler}
                  value={data.password}
                  type="password"
                  placeholder="Password"
                  required
                />
              </>
            )}

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
          onClose={handleRegisterClose} // Close both popups
        />
      )}

      <ToastContainer />
    </>
  );
};

export default LoginPopup;