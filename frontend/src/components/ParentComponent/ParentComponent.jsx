import React, { useState } from 'react';
import NavigationPopup from '../Navigationpopup/Navigationpopup'; // Import NavigationPopup

const ParentComponent = () => {
  const [location, setLocation] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(true); // Control whether popup is open

  // Handle location submission
  const handleLocationSubmit = (location) => {
    setLocation(location); // You can do further operations with the location here
    console.log('Location submitted:', location);
    setIsPopupOpen(false); // Close the popup after location is submitted
  };

  // Handle closing the popup
  const handleClose = () => {
    setIsPopupOpen(false); // Close the popup
  };

  return (
    <div>
      
      
    </div>
  );
};

export default ParentComponent;
