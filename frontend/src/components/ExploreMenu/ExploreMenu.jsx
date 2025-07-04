import React, { useEffect, useState, useContext } from 'react';
import './ExploreMenu.css';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import NavigationPopup from '../Navigationpopup/Navigationpopup';
import { StoreContext } from '../../Context/StoreContext';

const ExploreMenu = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const { setLocation } = useContext(StoreContext);

  const menuItems = [
    { menu_name: 'chicken', image: assets.chicken, label: 'Chicken' },
    { menu_name: 'fish', image: assets.fish, label: 'Fish' },
    { menu_name: 'mutton', image: assets.mutton, label: 'Mutton' },
    { menu_name: 'prawns', image: assets.prawns, label: 'Prawns' },
    { menu_name: 'eggs', image: assets.eggs, label: 'Eggs' },
  ];

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  setIsLoggedIn(!!user);

  // Use either the address from user OR the selectedLocation
  const storedLocation = localStorage.getItem('selectedLocation');
  const savedLocation = user?.address || storedLocation;

  if (savedLocation) {
    setLocationSelected(true);
    setLocation(savedLocation); // Set global state
  } else {
    setLocationSelected(false);
  }
  }, []);

  const handleNavigation = (menuName) => {
    if (!isLoggedIn || !locationSelected) {
      setPendingCategory(menuName);
      setShowPopup(true); // Ask for location or login
      return;
    }

    navigate(`/shops?category=${menuName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setPendingCategory(null);
  };

  const handleLocationSubmit = (location) => {
    console.log('Location selected:', location);
    localStorage.setItem('selectedLocation', location);
    setLocation(location);

    // Preserve and update user object
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const updatedUser = { ...user, address: location };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setShowPopup(false);
    setLocationSelected(true);

    if (pendingCategory) {
      navigate(`/shops?category=${pendingCategory}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setPendingCategory(null);
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
                className="add-to-cart-btn"
                onClick={() => handleNavigation(item.menu_name)}
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
                className="add-to-cart-btn"
                onClick={() => handleNavigation(item.menu_name)}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Location/Login Popup */}
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
