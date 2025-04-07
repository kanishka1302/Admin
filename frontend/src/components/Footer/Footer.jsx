import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';
import SugunaLogo from '../../assets/Suguna-Foods-Brand-Logo.png';
import VencobbLogo from '../../assets/vencobb.jpg';
import SnehaChickenLogo from '../../assets/sneha chicken.jpg';

const Footer = () => {
  return (
    <div>
      <h2 className="vendors-heading">Our Vendors</h2>
      {/* Scrolling Images Section */}
      <div className="scrolling-images">
        <div className="scrolling-images-content">
          <img src={SugunaLogo} alt="Suguna Foods Logo" />
          <img src={VencobbLogo} alt="Vencobb Logo" />
          <img src={SnehaChickenLogo} alt="Sneha Chicken Logo" />
          {/* Repeat the images to create a seamless scrolling effect */}
          <img src={SugunaLogo} alt="Suguna Foods Logo" />
          <img src={VencobbLogo} alt="Vencobb Logo" />
          <img src={SnehaChickenLogo} alt="Sneha Chicken Logo" />
          <img src={SugunaLogo} alt="Suguna Foods Logo" />
          <img src={VencobbLogo} alt="Vencobb Logo" />
          <img src={SnehaChickenLogo} alt="Sneha Chicken Logo" />
        </div>
      </div>

      {/* Footer Section */}
      <div className="footer" id="footer">
        <div className="footer-content">
          {/* Left Section */}
          <div className="footer-content-left">
            <div className="footer-logo-section">
              <img src={assets.logo} alt="NoVeg Logo" />
              <div className="divider"></div>
              <div className="app-download-platforms">
                <img src={assets.playstore} alt="Download on Google Play" />
              </div>
            </div>
            <p>
              NoVeg delivers freshly cut, high-quality meat directly from local vendors to your doorstep. We ensure that all our products are 100% fresh, never frozen, providing you with the best of the local market. Whether you need cuts for your everyday meals or special occasions, we promise prompt and reliable delivery in 45 minutes.
            </p>
            <div className="footer-social-icons">
              <a href="https://www.instagram.com/novegindia/" target="_blank" rel="noopener noreferrer">
                <img src={assets.insta} alt="Instagram" />
              </a>
              <a href="https://www.facebook.com/Novegindia/" target="_blank" rel="noopener noreferrer">
                <img src={assets.fb} alt="Facebook" />
              </a>
              <a href="https://www.youtube.com/channel/UCnsatxhN6fBs6aVbcK2pE4A" target="_blank" rel="noopener noreferrer">
                <img src={assets.yt} alt="YouTube" />
              </a>
            </div>
          </div>

          {/* Center Section */}
          <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
              <li className="footer-link">Home</li>
              <li className="footer-link">
                <a href="AboutUs" className="footer-link">About Us</a>
              </li>
              <li className="footer-link">Delivery</li>
              <li className="footer-link">Privacy Policy</li>
            </ul>
          </div>

          {/* Right Section */}
          <div className="footer-content-right">
            <h2>Get In Touch!!</h2>
            <h2>Chat with us</h2>
            <ul>
              <li>+91 7093276351</li>
              <li>Contact@noveg.pvt.ltd</li>
            </ul>
          </div>
          <div className="footer-content-right">
            <h2>Support Hours</h2>
            <ul>
              <li>Monday to Sunday: 9AM-6PM</li>
            </ul>
          </div>
        </div>

        <hr />
        <p className="footer-copyright">
          Copyright 2024 @ NoVeg.pvt.ltd - All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
