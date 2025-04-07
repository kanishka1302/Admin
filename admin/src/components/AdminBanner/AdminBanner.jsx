import React from 'react';
import './Adminbanner.css';
import { assets } from '../../assets/assets';

const AdminBanner = () => {
  return (
    <div className="Admin-banner-container">
      <img
        className="Admin-banner"
        src={assets.admin}  // Use the correct export name
        alt="Admin Banner"
      />
    </div>
  );
};

export default AdminBanner;

