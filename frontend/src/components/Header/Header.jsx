import React, { useEffect, useState } from "react";
import Banner2 from "../../assets/Banner2.jpg";
import WebsiteBanner from '../../assets/WebsiteBanner.jpg';
import "./Header.css"; // Import the CSS file

const Header = () => {
  const slides = [
    {
      image: Banner2,
    },
    {
      image: WebsiteBanner,
      text: "For those who demand the best",
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
  <div className="header-container">
    <img
      src={slides[currentIndex].image}
      alt="banner"
      className="header-image"
    />
    {slides[currentIndex].text && (
      <div className="header-text">
        <div>{slides[currentIndex].text}</div>
        <div className="header-subtext">-NoVeg</div>
      </div>
    )}
  </div>
);
}

export default Header;
