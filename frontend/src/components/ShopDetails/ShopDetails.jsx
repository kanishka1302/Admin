import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5000"; // Update if using a live server

const ShopDetails = () => {
  const { addToCart } = useContext(StoreContext);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category");  
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
      const response = await axios.get(`${API_BASE_URL}/api/food/list?shopId=${shopId}`);
      if (response.data.success) {
        const filteredItems = response.data.data.filter(item => item.category.toLowerCase() === category.toLowerCase());
        setFoodItems(filteredItems);
      } else {
        toast.error("Error fetching food items");
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
      toast.error("Failed to fetch food items");
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
      <div className="food-display">
        <div className="food-display-header">
          <h2>{selectedCategory} Items</h2>
          <p>Browse fresh {selectedCategory.toLowerCase()} options available at this shop!</p>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : foodItems.length > 0 ? (
          <div className="food-display-list">
            {foodItems.map((item) => (
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
          <p>No {selectedCategory.toLowerCase()} items available at this shop.</p>
        )}
      </div>
      {/* ✅ Updated ToastContainer with autoClose=1000 */}
      <ToastContainer autoClose={1000} />
    </div>
  );
};

export default ShopDetails;
