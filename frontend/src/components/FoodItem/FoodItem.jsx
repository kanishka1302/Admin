import { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const FoodItem = ({ id, name, price, description, image, quantity }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const getImagePath = (image) => {
    if (image?.startsWith("data:image")) return image;
    if (image?.startsWith("http")) return image;
    return `${url}/images/${image}`;
  };

  const handleAddToCart = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const location = localStorage.getItem("selectedLocation");
    const locationPopupShown = localStorage.getItem("locationPopupShown");

    if (!user || !location) {
      localStorage.removeItem("locationPopupShown");
      toast.info("Please select your delivery location.");
      const event = new CustomEvent("show-location-popup");
      window.dispatchEvent(event);
      return;
    }

    if (!locationPopupShown) {
      localStorage.setItem("locationPopupShown", "true");
      
      const event = new CustomEvent("show-location-popup");
      window.dispatchEvent(event);
      return;
    }

    addToCart(id);
    toast.success(`${name} added to cart!`);
  };

  const handleRemoveFromCart = (id) => {
    removeFromCart(id);
    toast.info(`${name} removed from cart!`);
  };

const displayQuantityWithUnit = () => {
    const numericQuantity = parseFloat(quantity);

    if (isNaN(numericQuantity) || numericQuantity === 0) {
      return '0';
    }

    // Check if the item name contains 'egg' (case-insensitive) AND quantity is exactly 12
    if (name.toLowerCase().includes('egg') && numericQuantity === 12) {
      return '1 dozen'; // Specific case for 12 eggs
    }
    // If it's an egg item but not exactly 12, show in dozens (e.g., 24 eggs -> 2 dozen)
    else if (name.toLowerCase().includes('egg')) {
      // Assuming eggs are always in multiples of 12 for dozen display
      if (numericQuantity % 12 === 0) {
        return `${numericQuantity / 12} dozen`;
      } else {
        return `${numericQuantity} eggs`; // Or you can decide how to handle non-dozen quantities of eggs
      }
    }
    // If quantity is 1000 or more, convert to kilograms
    else if (numericQuantity >= 1000) {
      return `${numericQuantity / 1000} kg`;
    }
    // Otherwise, show in grams
    else {
      return `${numericQuantity} grams`;
    }
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={getImagePath(image)}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = assets.fallback_image || '/images/fallback.jpg';
          }}
        />
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => handleAddToCart(id)}
            src={assets.add_icon_green}
            alt="Add to cart"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => handleRemoveFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove from cart"
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => handleAddToCart(id)}
              src={assets.add_icon_green}
              alt="Add more"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-weight">
          {displayQuantityWithUnit()}
        </p>

        <div className="food-item-price-cart">
          <p className="food-item-price">Rs.{price}</p>
          {cartItems[id] > 0 && (
            <button className="inline-view-cart-button" onClick={() => navigate("/cart")}>
              View Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

FoodItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired
};

export default FoodItem;
