import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';
import SugunaLogo from '../../assets/Suguna-Foods-Brand-Logo.png';
import VencobbLogo from '../../assets/vencobb.jpg';
import SnehaChickenLogo from '../../assets/sneha chicken.jpg';
import { Link } from 'react-router-dom'; // Import Link

const Footer = () => {

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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
              <li className="footer-link">
                <Link to="/" className="footer-link" onClick={scrollToTop}>Home</Link> {/* Home link updated */}
              </li>
              <li className="footer-link">
                <Link to="/AboutUs" className="footer-link" onClick={scrollToTop}>About Us</Link>
              </li>
              <li className="footer-link">
                <Link to="/Privacy-policy" className="footer-link" onClick={scrollToTop}>Privacy Policy</Link> {/* Updated link */}
              </li>
            </ul>
          </div>

          {/* Right Section */}
          <div className="footer-content-right">
            <h2>Get In Touch!!</h2>
            <ul>
              <li>Contact@noveg.pvt.ltd</li>
              <li>
                <Link to="/chat" className="chat-button"> Chat with us</Link>
              </li>
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
          Copyright 2025 @ NoVeg.pvt.ltd - All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
