import { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const images = [
    '/Banner1.jpg',
    '/Banner2.jpg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 3) % images.length);
    }, 6000); // Change image every 4 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [images.length]);

  return (
    <div
      className="header"
      style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
    >
      {/* Show content only for Banner1 */}
      {currentImageIndex === 0 && (
        <div className="header-contents">
          <h2>Order Your Meat!!</h2>
          <p>Make your day with fresh meat</p>
        </div>
      )}
    </div>
  );
};

export default Header;
