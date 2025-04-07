/* eslint-disable no-unused-vars */
// src/OtpVerification.js
import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const OtpVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setUpRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setUpRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        alert('OTP sent!');
      })
      .catch((error) => {
        console.error('Error during signInWithPhoneNumber', error);
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    confirmationResult.confirm(otp)
      .then((result) => {
        const user = result.user;
        alert('User  signed in successfully!');
      })
      .catch((error) => {
        console.error('Error verifying OTP', error);
      });
  };

  return (
    <div>
      <div id="recaptcha-container"></div>
      <form onSubmit={handleSendOtp}>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button type="submit">Send OTP</button>
      </form>

      <form onSubmit={handleVerifyOtp}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default OtpVerification;