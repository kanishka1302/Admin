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
  const [showChat, setShowChat] = useState(false); // ✅ Toggle chat
  const { getTotalCartAmount, token, setToken, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();

  // ✅ Load token and location on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }

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

  // ✅ Open Location Popup
  const handleSelectLocation = () => {
    setIsPopupOpen(true);
  };

  // ✅ Save location
  const onLocationSubmit = (message) => {
    setIsPopupOpen(false);
    setSelectedLocation(message);
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const updatedUser = { ...storedUser, address: message };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('locationPopupShown');
    localStorage.removeItem('user');
    setToken(null);
    clearCart();
    navigate('/');
  };

  // ✅ Profile Page
  const handleProfileClick = () => navigate('/userinfo');

  // ✅ Toggle Chat (Now Opens Immediately Without Reload)
  const handleChatClick = () => {
    if (token) {
      setShowChat(!showChat); // ✅ Toggle Chat Instantly
    } else {
      setShowLogin(true);
    }
  };

  // ✅ Navigate to Home
  const handleHomeClick = () => {
    setMenu('Home');
    navigate('/');
  };

  // ✅ Navigate to Catalog
  const handleCatalogClick = () => {
    setMenu('Catalog');
    navigate('/');
    setTimeout(() => {
      document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="logo" />
      </Link>

      <div className="navbar-center">
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
            <a href="#footer" 
              onClick={() => setMenu('Contact Us')} 
              className={menu === 'Contact Us' ? 'active' : ''}
            >
              <i className="fa-solid fa-envelope"></i> Contact Us
            </a>
          </li>
        </ul>
      </div>

      {/* ✅ Location */}
      <div className="navbar-right">
        <div className="select-location" onClick={handleSelectLocation}>
          <img src={locationIcon} alt="Location Icon" className="location-icon" />
          <span>{selectedLocation}</span>
        </div>

        {/* ✅ Cart */}
        <div className="navbar-searchicon">
          <Link to="/cart">
            <img src={assets.basketicon} alt="Basket Icon" />
          </Link>
          <div className={getTotalCartAmount() > 0 ? 'dot' : ''}></div>
        </div>

        {/* ✅ Login / Profile */}
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

      {/* ✅ Location Popup */}
      {isPopupOpen && (
        <NavigationPopup
          onClose={() => setIsPopupOpen(false)}
          onLocationSubmit={onLocationSubmit}
        />
      )}

      {/* ✅ Render Chat Dynamically */}
      {showChat && <Chat />}
    </div>
  );
};

export default Navbar;
