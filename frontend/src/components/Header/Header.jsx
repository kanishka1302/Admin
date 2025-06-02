import React, { useEffect, useState } from "react";
import Banner1 from "../../assets/Banner1.jpg";
import Banner2 from "../../assets/Banner2.jpg";
import WebsiteBanner from "../../assets/WebsiteBanner.jpg";
import "./Header.css"; // Import the CSS file

const Header = () => {
  const slides = [
    {
      image: Banner2,
    },
    {
      image: WebsiteBanner,
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
      <div className="header-text">
        {slides[currentIndex].text}
      </div>
    </div>
  );
};

export default Header;
