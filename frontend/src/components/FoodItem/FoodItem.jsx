import { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify'; // Importing toast
import PropTypes from 'prop-types'; // Importing PropTypes

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  // Function to get the correct image path
  const getImagePath = (image) => {
    // If image starts with "http", return it as is, else add the base URL
    const imagePath = image?.startsWith('http') ? image :` ${url}/uploads/${image}`;
    console.log('Image Path:', imagePath);  // Debugging the image path
    return imagePath;
  };

  const handleAddToCart = (id) => {
    addToCart(id);
    toast.success(`${name} added to cart!`); // Success toast when item is added
  };

  const handleRemoveFromCart = (id) => {
    removeFromCart(id);
    toast.info(`${name} removed from cart!`); // Info toast when item is removed
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={getImagePath(image)} alt={name} />
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => handleAddToCart(id)}
            src={assets.add_icon_green} // Using the new add to cart icon
            alt="Add to cart"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => handleRemoveFromCart(id)}
              src={assets.remove_icon_red} // Using the new remove from cart icon
              alt="Remove from cart"
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => handleAddToCart(id)}
              src={assets.add_icon_green} // Using the new add more icon
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
        <p className="food-item-weight">500 g</p>
        <p className="food-item-price">Rs.{price}</p>
      </div>
    </div>
  );
};

// Adding prop types
FoodItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired
};

export default FoodItem;