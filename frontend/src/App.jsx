import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
// eslint-disable-next-line no-unused-vars
import ExploreMenu from './components/ExploreMenu/ExploreMenu';
import SearchResults from './components/SearchResults/SearchResults.jsx';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import MyOrders from './pages/MyOrders/MyOrders';
import Verify from './pages/Verify/Verify';
import FoodDisplay from './components/FoodDisplay/FoodDisplay.jsx';
import Wallet from './pages/Wallet/Wallet.jsx';
import AboutUs from './pages/AboutUs/AboutUs';
import UserInfo from './pages/UserInfo/UserInfo.jsx'; // Importing UserInfo component
import Chat from './pages/Chat/Chat'; // Importing Chat component
import Shops from './pages/Shops/Shops'; // Importing Shops page
import ShopDetails from './components/ShopDetails/ShopDetails'; // Import ShopDetails page
import RegisterPopup from './components/RegisterPopup/Registerpopup.jsx';
import ParentComponent from './components/ParentComponent/ParentComponent'; // Import ParentComponent

const App = () => {
  const [showLogin, setShowLogin] = useState(false); // State for showing login popup
  const [category, setCategory] = useState('All'); // State for category selection
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); // State for showing RegisterPopup

  const navigate = useNavigate(); // For navigation

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Set user as logged in
    // No need to call navigate here, as we already handle the redirect in Verify.jsx
  };

  const handleRegisterSuccess = () => {
    // Handle the post-registration logic (you can update the state here as needed)
    setIsRegisterOpen(false); // Close the registration popup
  };

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null} {/* Conditional rendering of LoginPopup */}

      {isRegisterOpen ? (
        <RegisterPopup isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onRegisterSuccess={handleRegisterSuccess} />
      ) : null} {/* Conditional rendering of RegisterPopup */}

      <div className="app">
        <Navbar setShowLogin={setShowLogin} category={category} setCategory={setCategory} />
        
        {/* Include ParentComponent for location popup */}
        <ParentComponent />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify onLoginSuccess={handleLoginSuccess} />} /> {/* Pass login success handler */}
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/explore" element={<FoodDisplay category={category} setCategory={setCategory} />} />
          <Route path="/search" element={<SearchResults category={category} setCategory={setCategory} />} />
          <Route path="/wallet" element={<Wallet />} /> {/* Add Wallet route */}
          <Route path="/AboutUs" element={<AboutUs />} /> {/* Add AboutUs route */}
          <Route path="/userinfo" element={<UserInfo />} /> {/* Add UserInfo route */}
          <Route path="/chat" element={<Chat />} /> {/* Add Chat route */}
          <Route path="/shops" element={<Shops />} /> {/* Add Shops route */}
          <Route path="/shop-details" element={<ShopDetails />} /> {/* Add ShopDetails route */}
        </Routes>
      </div>

      <Footer />
    </>
  );
};

export default App;
