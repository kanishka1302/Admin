import React, { useState } from 'react';
import NavigationPopup from '../Navigationpopup/Navigationpopup'; // Import NavigationPopup

const ParentComponent = () => {
  const [location, setLocation] = useState(localStorage.getItem('location') || ''); 
  const [isPopupOpen, setIsPopupOpen] = useState(true); // Control whether popup is open

  // Handle location submission
  const handleLocationSubmit = (newlocation) => {
    setLocation(newlocation); // You can do further operations with the location here
    console.log('Location submitted:', newlocation);
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
