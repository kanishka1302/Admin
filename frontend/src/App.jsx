import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // ✅ Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import Toast styles

import Navbar from './components/Navbar/Navbar';
import ExploreMenu from './components/ExploreMenu/ExploreMenu';
import SearchResults from './components/SearchResults/SearchResults.jsx';
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
import UserInfo from './pages/UserInfo/UserInfo.jsx';
import Chat from './pages/Chat/Chat';
import Shops from './pages/Shops/Shops';
import ShopDetails from './components/ShopDetails/ShopDetails';
import RegisterPopup from './components/Registerpopup/Registerpopup.jsx';
import ParentComponent from './components/ParentComponent/ParentComponent';
//import Map from './pages/Map/Map'; 
import DeliveryAddress from './pages/DeliveryAddress/DeliveryAddress'; 
import Privacypolicy from './components/Privacypolicy/Privacypolicy';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [category, setCategory] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
  };

  return (
    <>
      {/* ✅ Global Toast Notification Configuration */}
      <ToastContainer autoClose={1000} />

      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      {isRegisterOpen && (
        <RegisterPopup 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)} 
          onRegisterSuccess={handleRegisterSuccess} 
        />
      )}

      <div className="app">
        <Navbar setShowLogin={setShowLogin} category={category} setCategory={setCategory} />
        <ParentComponent />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder selectedAddress={selectedAddress} />} /> 
          <Route path="/verify" element={<Verify onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/explore" element={<FoodDisplay category={category} setCategory={setCategory} />} />
          <Route path="/search" element={<SearchResults category={category} setCategory={setCategory} />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/userinfo" element={<UserInfo />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shop-details" element={<ShopDetails />} />
          <Route path="/map" element={<Map />} /> 
          <Route path="/address" element={<DeliveryAddress onSelectAddress={setSelectedAddress} />} /> 
          <Route path="/privacy-policy" element={<Privacypolicy />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
};

export default App;
