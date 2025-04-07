// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Your web app's Firebase configuration (Replace this with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyCVELgzAMPW9x30-kmZSxpPzb1USPDDTZc",
    authDomain: "noveg-d1387.firebaseapp.com",
    projectId: "noveg-d1387",
    storageBucket: "noveg-d1387.firebasestorage.app",
    messagingSenderId: "374255190138",
    appId: "1:374255190138:web:b241211d99f085692dfbc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };