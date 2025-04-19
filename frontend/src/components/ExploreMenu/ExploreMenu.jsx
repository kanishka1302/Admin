import React, { useEffect, useState } from 'react';
import './ExploreMenu.css';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import NavigationPopup from '../Navigationpopup/Navigationpopup.jsx';

const ExploreMenu = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(null); // 🆕 hold category before login

  const menuItems = [
    { menu_name: 'chicken', image: assets.chicken, label: 'Chicken' },
    { menu_name: 'fish', image: assets.fish, label: 'Fish' },
    { menu_name: 'mutton', image: assets.mutton, label: 'Mutton' },
    { menu_name: 'prawns', image: assets.prawns, label: 'Prawns' },
    { menu_name: 'eggs', image: assets.eggs, label: 'Eggs' },
  ];

  const isShopClosed = () => {
    const currentHour = new Date().getHours();
    return currentHour < 8 || currentHour >= 22;
  };

  useEffect(() => {
    if (isShopClosed()) {
      setIsModalOpen(true);
    }
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleNavigation = (menuName) => {
    if (isShopClosed()) {
      setIsModalOpen(true);
      return;
    }

    if (!isLoggedIn) {
      setPendingCategory(menuName); // 🆕 save the category
      setShowPopup(true);
      return;
    }

    navigate(`/shops?category=${menuName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setPendingCategory(null); // 🧹 optional: clear pending category
  };

  const handleLocationSubmit = (location) => {
    console.log('Location selected:', location);
    setShowPopup(false);

    if (pendingCategory) {
      navigate(`/shops?category=${pendingCategory}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setPendingCategory(null); // 🧹 clear after navigation
    }
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <div className="creative-header">
        <h1>Indulge in Freshness</h1>
        <p className="creative-subtext">
          Handpicked cuts of premium meats, ready to make your meals extraordinary. Scroll through and discover the
          perfect ingredients for your next culinary masterpiece!
        </p>
      </div>

      <div className="explore-menu-cards">
        <div className="menu-row">
          {menuItems.slice(0, 3).map((item) => (
            <div className="menu-card" key={item.menu_name}>
              <img src={item.image} alt={item.label} className="menu-card-image" />
              <h3 className="menu-card-title">{item.label}</h3>
              <button
                className={`add-to-cart-btn ${isShopClosed() ? 'disabled' : ''}`}
                onClick={() => handleNavigation(item.menu_name)}
                disabled={isShopClosed()}
              >
                + Add
              </button>
            </div>
          ))}
        </div>

        <div className="menu-row">
          {menuItems.slice(3).map((item) => (
            <div className="menu-card" key={item.menu_name}>
              <img src={item.image} alt={item.label} className="menu-card-image" />
              <h3 className="menu-card-title">{item.label}</h3>
              <button
                className={`add-to-cart-btn ${isShopClosed() ? 'disabled' : ''}`}
                onClick={() => handleNavigation(item.menu_name)}
                disabled={isShopClosed()}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ⚠ Shop Closed Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>⚠ Shop Closed</h2>
            <p>
              You cannot order items now. The shop will be available from <strong>8 AM - 10 PM</strong>.
            </p>
            <button onClick={() => setIsModalOpen(false)}>Okay, Got it</button>
          </div>
        </div>
      )}

      {/* 🔒 Login Location Popup */}
      {showPopup && (
        <NavigationPopup
          onClose={handlePopupClose}
          onLocationSubmit={handleLocationSubmit}
        />
      )}
    </div>
  );
};

export default ExploreMenu;
