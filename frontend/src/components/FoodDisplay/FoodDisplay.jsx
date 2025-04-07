import React from 'react';
import './FoodDisplay.css';
import { assets } from '../../assets/assets';  // Adjust path as necessary

const FoodDisplay = ({ category = 'All' }) => {
  return (
    <div className="food-display" id="food-display">
      <div className="food-display-list">
        <div className="banner-container">
          <img
            src={assets.installBanner}  // Using the import for installBanner image
            alt="Install Banner"
            className="install-banner"
          />
        </div>
      </div>
    </div>
  );
};

export default FoodDisplay;
