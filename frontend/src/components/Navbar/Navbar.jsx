import React, { useState, useContext, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext.jsx';
import NavigationPopup from '../Navigationpopup/Navigationpopup.jsx';
import locationIcon from '../../assets/icons8-location-48.png';
import loginIcon from '../../assets/icons8-login-24.png';
import profileIcon from '../../assets/icons8-profile-32.png';
import chatIcon from '../../assets/icons8-chat-room-24.png';
import Chat from '../../pages/Chat/Chat.jsx';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState('menu');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const [showChat, setShowChat] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const { getTotalCartAmount, token, setToken, clearCart, location, setLocation } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const hasShownPopup = localStorage.getItem("locationPopupShown");
  
    // Only show popup if the user is logged in and the popup hasn't been shown yet
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !hasShownPopup) {
      setShowLocationPopup(true);
      localStorage.setItem("locationPopupShown", "true");
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.address) {
      setSelectedLocation(storedUser.address);
    }

    const locationPopupShown = localStorage.getItem('locationPopupShown');
    if (savedToken && !locationPopupShown) {
      setIsPopupOpen(true);
      localStorage.setItem('locationPopupShown', 'true');
    }
  }, [setToken]);
  useEffect(() => {
    // Update selectedLocation whenever location from context changes
    setSelectedLocation(location);
  }, [location]);  

  const handleSelectLocation = () => setIsPopupOpen(true);

  const onLocationSubmit = (locationName) => {
    // Set the selected location name in the UI
    setSelectedLocation(locationName);
    setLocation(locationName);
    setIsPopupOpen(false);
  
    // Save the full location name in localStorage user address
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const updatedUser = { ...storedUser, address: locationName };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('locationPopupShown');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedLocation');
    setToken(null);
    clearCart();
    setLocation('');
    setSelectedLocation('Select Location');
    navigate('/');
  };

  const handleProfileClick = () => navigate('/userinfo');

  const handleChatClick = () => {
    if (token) {
      setShowChat(!showChat);
    } else {
      setShowLogin(true);
    }
  };

  const handleHomeClick = () => {
    setMenu('Home');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleCatalogClick = () => {
    setMenu('Catalog');
    navigate('/');
    setTimeout(() => {
      document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    setIsMobileMenuOpen(false);
  };

  const handleContactClick = () => {
    setMenu('Contact Us');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="logo" />
      </Link>

      {/* Hamburger Icon */}
      <button className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Navbar Menu */}
      <div className={`navbar-center ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul className="navbar-menu">
          <li>
            <span
              onClick={handleHomeClick}
              className={menu === 'Home' ? 'active' : ''}
            >
              <i className="fa-solid fa-house"></i> Home
            </span>
          </li>
          <li>
            <span
              onClick={handleCatalogClick}
              className={menu === 'Catalog' ? 'active' : ''}
            >
              <i className="fa-solid fa-th-list"></i> Catalog
            </span>
          </li>
          <li>
            <a
              href="#footer"
              onClick={handleContactClick}
              className={menu === 'Contact Us' ? 'active' : ''}
            >
              <i className="fa-solid fa-envelope"></i> Contact Us
            </a>
          </li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Location */}
        <div className="select-location" onClick={handleSelectLocation}>
          <img src={locationIcon} alt="Location Icon" className="location-icon" />
          <span>{selectedLocation || 'select location'}</span>
        </div>

        {/* Cart */}
        <div className="navbar-searchicon">
          <Link to="/cart">
            <img src={assets.basketicon} alt="Basket Icon" className="basket-icon" />
          </Link>
          <div className={getTotalCartAmount() > 0 ? 'dot' : ''}></div>
        </div>

        {/* Login / Profile */}
        {!token ? (
          <span className="login-text" onClick={() => setShowLogin(true)}>
            <img src={loginIcon} alt="Login Icon" className="login-icon" />
            Log In
          </span>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="Profile Icon" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="Orders Icon" />
                <p>Orders</p>
              </li>
              <li onClick={() => navigate('/wallet')}>
                <img src={assets.wallet_icon} alt="Wallet Icon" />
                <p>Wallet</p>
              </li>
              <li onClick={handleProfileClick}>
                <img src={profileIcon} alt="Profile Icon" />
                <p>Profile</p>
              </li>
              <li onClick={handleChatClick}>
                <img src={chatIcon} alt="Chat Icon" />
                <p>Chat</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="Logout Icon" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Location Popup */}
      {isPopupOpen && (
        <NavigationPopup
          onClose={() => setIsPopupOpen(false)}
          onLocationSubmit={onLocationSubmit}
        />
      )}

      {/* Chat */}
      {showChat && <Chat />}
    </div>
  );
};

export default Navbar;
