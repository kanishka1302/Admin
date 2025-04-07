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

const Navbar = ({ setShowLogin, category, setCategory }) => {
  const [menu, setMenu] = useState('menu');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const { getTotalCartAmount, token, setToken, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, [setToken]);

  const handleSelectLocation = () => {
    setIsPopupOpen(true);
  };

  const onLocationSubmit = (message) => {
    setIsPopupOpen(false);
    setSelectedLocation(message);  // Set the location when pincode is submitted or current location is fetched
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    setToken(null);
    clearCart();
    navigate('/');
  };

  const handleProfileClick = () => navigate('/userinfo');
  const handleChatClick = () => navigate('/chat');

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.noveglogo} alt="Logo" className="logo" />
      </Link>

      <div className="navbar-center">
        <ul className="navbar-menu">
          <li>
            <Link to="/" onClick={() => setMenu('Home')} className={menu === 'Home' ? 'active' : ''}>
              <i className="fa-solid fa-house"></i> Home
            </Link>
          </li>
          <li>
            <a href="#explore-menu" onClick={() => setMenu('Catalog')} className={menu === 'Catalog' ? 'active' : ''}>
              <i className="fa-solid fa-th-list"></i> Catalog
            </a>
          </li>
          <li>
            <a href="#footer" onClick={() => setMenu('Contact Us')} className={menu === 'Contact Us' ? 'active' : ''}>
              <i className="fa-solid fa-envelope"></i> Contact Us
            </a>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <div className="select-location" onClick={handleSelectLocation}>
          <img src={locationIcon} alt="Location Icon" className="location-icon" />
          <span>{selectedLocation}</span>
        </div>

        <div className="navbar-searchicon">
          <Link to="/cart">
            <img src={assets.basketicon} alt="Basket Icon" />
          </Link>
          <div className={getTotalCartAmount() > 0 ? 'dot' : ''}></div>
        </div>

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

      {isPopupOpen && (
        <NavigationPopup
          onClose={() => setIsPopupOpen(false)}
          onLocationSubmit={onLocationSubmit}
        />
      )}
    </div>
  );
};

export default Navbar;
