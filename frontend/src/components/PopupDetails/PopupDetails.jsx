import { useContext, useState } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential 
} from 'firebase/auth';
import axios from 'axios';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { auth } from '../../firebase';

// eslint-disable-next-line react/prop-types
const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

  const [currState] = useState('Login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);

  const [data, setData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Test user credentials for easy testing
  const testCredentials = {
    phone: '1234567890',
    email: 'testuser@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  

  const requestOtp = async () => {
    // Optional: Auto-fill OTP for testing (in real app, this should not exist)
    if (phoneNumber === testCredentials.phone) {
      setVerificationId('test-verification-id');
      setOtp('123456');
      alert('Test OTP auto-filled');
      return;
    }

    if (phoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('Recaptcha solved');
        }
      });

      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        `+91${phoneNumber}`, 
        window.recaptchaVerifier
      );
      
      setVerificationId(confirmationResult.verificationId);
      alert('OTP sent!');
    } catch (error) {
      console.error('OTP Request Error:', error);
      alert('Failed to send OTP: ' + error.message);
    }
  };

  const verifyOtp = async () => {
    // Allow automatic verification for test phone number
    if (phoneNumber === testCredentials.phone && otp === '123456') {
      alert('Test OTP verified successfully');
      setToken('test-user-token');
      setShowLogin(false);
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      
      alert('Phone number verified successfully');
      setToken(result.user.uid);
      setShowLogin(false);
    } catch (error) {
      console.error('OTP Verification Error:', error);
      alert('OTP verification failed: ' + error.message);
    }
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = url;

    // Add test login bypass
    if (
      (currState === 'Login' && data.email === testCredentials.email && data.password === testCredentials.password) ||
      (currState === 'Login' && phoneNumber === testCredentials.phone)
    ) {
      setToken('test-user-token');
      localStorage.setItem('token', 'test-user-token');
      setShowLogin(false);
      return;
    }

    if (currState === 'Login') {
      newUrl += '/api/user/login';
    } else {
      newUrl += '/api/user/register';
    }

    try {
      const response = await axios.post(newUrl, data);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setShowLogin(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.crossicon} alt="Close" />
        </div>

        <div className="login-popup-inputs">
          {currState === 'Login' ? (
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
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginPopup;
