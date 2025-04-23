import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./ShopDetails.css";

const API_BASE_URL = "http://localhost:5000"; // Update this for production

const ShopDetails = () => {
  const { addToCart } = useContext(StoreContext);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const selectedCategory = params.get("category") || "Food";
  const selectedShopId = params.get("shopId");

  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedShopId) {
      fetchFoodItems(selectedShopId, selectedCategory);
    }
  }, [selectedShopId, selectedCategory]);

  const fetchFoodItems = async (shopId, category) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/food/list?shopId=${shopId}`);
      if (data.success) {
        const filtered = data.data.filter(
          item => item.category.toLowerCase() === category.toLowerCase()
        );
        setFoodItems(filtered);
      } else {
        toast.error("Failed to fetch food items.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong while loading food items.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (itemId) => {
    addToCart(itemId, 1);
    toast.success("Item added to cart!");
  };

  return (
    <div className="food-display-wrapper">
      <ToastContainer autoClose={1000} />

      <h2 className="header">{selectedCategory} Items</h2>
      <p className="header">
        Browse fresh {selectedCategory.toLowerCase()} options available at this shop!
      </p>

      <div className="food-display">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : foodItems.length > 0 ? (
          <div className="food-display-list1">
            {foodItems.map(item => (
              <FoodItem
                key={item._id}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                onAddToCart={() => handleAddToCart(item._id)}
              />
            ))}
          </div>
        ) : (
          <p className="no-items-text">No {selectedCategory.toLowerCase()} items available at this shop.</p>
        )}
      </div>
    </div>
  );
};

export default ShopDetails;
