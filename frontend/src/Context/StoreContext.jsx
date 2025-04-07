import { createContext, useEffect, useState } from "react";
import axios from "axios";
import noveglogo from "../assets/noveglogo.jpg";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000"; // Using port 4000 as in the second version
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(""); // Store userId separately
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState([]);
  const currency = "₹";
  const deliveryCharge = 50;
  const [selectedShop, setSelectedShop] = useState(() => {
    return localStorage.getItem("selectedShop") || "";
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Initialize cart items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    return storedCartItems ? JSON.parse(storedCartItems) : {};
  });

  // Initialize shop names from localStorage
  const [shopNames, setShopNames] = useState(() => {
    const storedShopNames = localStorage.getItem("shopNames");
    return storedShopNames ? JSON.parse(storedShopNames) : {};
  });

  // Format weight display
  const formatWeight = (item, quantity) => {
    if (item.category.toLowerCase() === "eggs") {
      return `${quantity} ${quantity === 1 ? "Dozen" : "Dozens"}`;
    }
  
    const baseWeight = item.weight || 500; // Default to 500g if weight is missing
    const totalWeight = baseWeight * quantity;
  
    if (totalWeight >= 1000) {
      return `${(totalWeight / 1000).toFixed(1)} kg`;
    }
  
    return `${totalWeight} g`;
  };
  

  // Ensure token and userId are retrieved correctly on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("🔍 Raw User Data from localStorage:", storedUser);
    
    // Set token from localStorage
    setToken(localStorage.getItem("token") || "");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.userId || parsedUser?._id || ""); // Extract userId
        console.log("✅ Extracted Token:", localStorage.getItem("token"));
        console.log("✅ Extracted User ID:", parsedUser?.userId || parsedUser?._id);
      } catch (error) {
        console.error("❌ Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  // Function to calculate total cart amount
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, quantity]) => {
      const item = food_list.find((food) => food._id === id);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  // Add item to the cart
  const addToCart = (itemId, quantity = 1) => {
    if (!userId) {
      console.error("User must be logged in to add items to the cart.");
      return;
    }

    setCartItems((prev) => {
      const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + quantity };
      // Store cart items with user-specific key
      localStorage.setItem(`cartItems_${userId}`, JSON.stringify(updatedCart));
      localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // For backward compatibility

      // Set shop name only if not already set
      if (!shopNames[itemId] && selectedShop?.name) {
        setShopNameForItem(itemId, selectedShop.name);
      }
      return updatedCart;
    });
  };

  // Remove item from the cart
  const removeFromCart = (itemId) => {
    if (!userId) return;

    setCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId] > 1) updatedCart[itemId] -= 1;
      else delete updatedCart[itemId];
      
      // Update both storage locations
      localStorage.setItem(`cartItems_${userId}`, JSON.stringify(updatedCart));
      localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // For backward compatibility
      
      return updatedCart;
    });
  };

  // Clear cart after order placement
  const clearCart = () => {
    console.log("🧹 Clearing cart...");
    if (userId) {
      localStorage.removeItem(`cartItems_${userId}`);
    }
    localStorage.removeItem("cartItems"); // For backward compatibility
    setCartItems({});
  };

  // Function to set shop name for an item
  const setShopNameForItem = (itemId, shopName) => {
    setShopNames((prev) => {
      const updatedShopNames = { ...prev, [itemId]: shopName };
      localStorage.setItem("shopNames", JSON.stringify(updatedShopNames));
      return updatedShopNames;
    });
  };

  // Fetch food list from the API
  const fetchFoodList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data || []);
      } else {
        throw new Error("Failed to load food list from server.");
      }
    } catch (error) {
      console.error("Error fetching food list:", error.message);
      setError("Failed to load food list. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${url}/api/orders/userorders`,
        { userId: userId || token }, // Use userId if available, fall back to token
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        console.error("Error fetching orders: Response unsuccessful");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      setOrders([]);
    }
  };

  // Logout function
  const logoutUser = () => {
    setToken("");
    setUserId("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    setCartItems({});
    setOrders([]);
  };

  // Apply promo code
  const applyPromoCode = (code) => {
    if (code === "DISCOUNT10") {
      setPromoCode(code);
      setDiscountApplied(true);
    } else {
      setPromoCode("");
      setDiscountApplied(false);
    }
  };

  // Restore cart based on userId
  useEffect(() => {
    console.log("Token or userId changed, checking cart...");
    if (userId) {
      const savedCart = localStorage.getItem(`cartItems_${userId}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [userId]);

  // Group items by shop
  const groupItemsByShop = () => {
    const groupedItems = {};

    Object.entries(cartItems).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        const item = food_list.find((food) => food._id === itemId);
        if (item) {
          const shopName = shopNames[itemId] || "Unknown Shop";
          if (!groupedItems[shopName]) {
            groupedItems[shopName] = [];
          }
          groupedItems[shopName].push({...item, quantity});
        }
      }
    });

    return groupedItems;
  };

  // Fetch the food list when the component mounts
  useEffect(() => {
    fetchFoodList();
    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <img src={noveglogo} alt="Company Logo" style={styles.loader} />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <StoreContext.Provider
      value={{
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        promoCode,
        applyPromoCode,
        discountApplied,
        currency,
        deliveryCharge,
        token,
        userId,
        setToken,
        url,
        selectedShop,
        setSelectedShop,
        shopNames,
        setShopNames,
        orders,
        fetchOrders,
        clearCart,
        selectedAddress,
        setSelectedAddress,
        groupItemsByShop,
        logoutUser,
        orderPlaced,
        setOrderPlaced,
        formatWeight, // Ensure formatWeight is included in context value
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// Loader styles
const styles = {
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "white",
  },
  loader: {
    width: "150px",
    height: "auto",
  },
};

export default StoreContextProvider;