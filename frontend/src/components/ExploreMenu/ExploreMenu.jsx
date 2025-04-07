import React from 'react';
import './ExploreMenu.css';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets'; // Ensure the path is correct

const ExploreMenu = () => {
  const navigate = useNavigate();

  // Define the menu items dynamically using images from the assets file
  const menuItems = [
    { menu_name: 'chicken', image: assets.chicken, label: 'Chicken' },
    { menu_name: 'fish', image: assets.fish, label: 'Fish' },
    { menu_name: 'mutton', image: assets.mutton, label: 'Mutton' },
    { menu_name: 'prawns', image: assets.prawns, label: 'Prawns' },
    { menu_name: 'eggs', image: assets.eggs, label: 'Eggs' },
  ];

  return (
    <div className="explore-menu" id="explore-menu">
      {/* Creative Header */}
      <div className="creative-header">
        <h1>Indulge in Freshness</h1>
        <p className="creative-subtext">
          Handpicked cuts of premium meats, ready to make your meals extraordinary. Scroll through and discover the
          perfect ingredients for your next culinary masterpiece!
        </p>
      </div>

      {/* Cards Section */}
      <div className="explore-menu-cards">
        {/* Top Row: Chicken, Fish, Mutton */}
        <div className="menu-row">
          {menuItems.slice(0, 3).map((item) => (
            <div className="menu-card" key={item.menu_name}>
              <img src={item.image} alt={item.label} className="menu-card-image" />
              <h3 className="menu-card-title">{item.label}</h3>
              <button
                className="add-to-cart-btn"
                onClick={() => navigate(`/shops?category=${item.menu_name}`)}
              >
                + Add
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Row: Prawns, Eggs */}
        <div className="menu-row">
          {menuItems.slice(3).map((item) => (
            <div className="menu-card" key={item.menu_name}>
              <img src={item.image} alt={item.label} className="menu-card-image" />
              <h3 className="menu-card-title">{item.label}</h3>
              <button
                className="add-to-cart-btn"
                onClick={() => navigate(`/shops?category=${item.menu_name}`)}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreMenu;