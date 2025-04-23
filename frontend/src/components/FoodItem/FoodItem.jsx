import { useContext } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "./FoodItem.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  const getImagePath = (img) => {
    return img?.startsWith("http") ? img : `${url}/images/${img}`;
  };

  const handleAdd = () => {
    addToCart(id);
    toast.success(`${name} added to cart!`);
  };

  const handleRemove = () => {
    removeFromCart(id);
    toast.info(`${name} removed from cart!`);
  };

  const quantity = cartItems[id] || 0;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={getImagePath(image)}
          alt={`Image of ${name}`}
        />

        {quantity === 0 ? (
          <img
            className="add"
            src={assets.add_icon_green}
            alt="Add to cart"
            onClick={handleAdd}
            role="button"
          />
        ) : (
          <div className="food-item-counter">
            <img
              src={assets.remove_icon_red}
              alt="Remove one"
              onClick={handleRemove}
              role="button"
            />
            <p>{quantity}</p>
            <img
              src={assets.add_icon_green}
              alt="Add one more"
              onClick={handleAdd}
              role="button"
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
          {name.toLowerCase().includes("eggs") ? "1 dozen" : "500 g"}
        </p>
        <p className="food-item-price">Rs. {price}</p>
      </div>
    </div>
  );
};

FoodItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default FoodItem;
