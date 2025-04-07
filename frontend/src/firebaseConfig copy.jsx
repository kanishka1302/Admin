// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFNUB2ITHsU_j2w6ydTYXCJbh0HpUYbJo",
  authDomain: "myproject-3b2e1.firebaseapp.com",
  projectId: "myproject-3b2e1",
  storageBucket: "myproject-3b2e1.firebasestorage.app",
  messagingSenderId: "436381855298",
  appId: "1:436381855298:web:881c6ec8b3ced45270c7db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const fireDB = getFirestore(app);

const auth = getAuth(app);

export {auth, fireDB}