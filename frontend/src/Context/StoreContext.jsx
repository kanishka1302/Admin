import { createContext, useEffect, useState,  useRef } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
export const socket = io("https://socket1-8bma.onrender.com");  // replace with your server URL


export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "https://admin-92vt.onrender.com";
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState([]);
  const currency = "₹";
  const deliveryCharge = 50;
  const [selectedShop, setSelectedShop] = useState(() => localStorage.getItem("selectedShop") || "");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [location, setLocation] = useState(localStorage.getItem('location') || '');
  const [userMobileNumber, setUserMobileNumber] = useState(null);
  const hasFetchedCart = useRef(false);

// Set userMobileNumber when the user logs in or on page load if available
useEffect(() => {
  // Assuming userMobileNumber is stored in localStorage or context
  const savedMobileNumber = localStorage.getItem('userMobileNumber');
  if (savedMobileNumber) {
    setUserMobileNumber(savedMobileNumber);
  }
}, []);

  const [cartItems, setCartItems] = useState(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    return storedCartItems ? JSON.parse(storedCartItems) : {};
  });

  const [shopNames, setShopNames] = useState(() => {
    const storedShopNames = localStorage.getItem("shopNames");
    return storedShopNames ? JSON.parse(storedShopNames) : {};
  });

  // 💰 Wallet-related state
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);

  const formatCartArrayToObject = (cartArray = []) => {
    const cartObj = {};
    cartArray.forEach((item) => {
      if (item.productId && item.quantity !== undefined) {
        cartObj[item.productId] = item.quantity;
      }
    });
    return cartObj;
  };
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setToken(localStorage.getItem("token") || "");
  
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.userId || parsedUser?._id || "");
  
        // ✅ Clean fallback logic
        const contactId = parsedUser.mobileNumber || parsedUser.email;
        if (contactId) {
          setUserMobileNumber(contactId);
          localStorage.setItem("userMobileNumber", contactId);
        }
      } catch (error) {
        console.error("❌ Error parsing user data from localStorage:", error);
      }
    }
  }, []);
  

  // 🛒 Cart logic
const getTotalCartAmount = () => {
  return Object.entries(cartItems).reduce((total, [id, quantity]) => {
    const item = food_list.find((food) => food._id === id);
    return total + (item?.price || 0) * quantity;
  }, 0);
};

const clearCartFromLocalStorage = () => {
  localStorage.removeItem("cartItems");
  if (userMobileNumber) {
    localStorage.removeItem(`cartItems_${userMobileNumber}`);
  }
  setCartItems({});
  console.log("🧹 Cart cleared from localStorage and React state");
};

const addToCart = async (itemId, quantity = 1, shopName) => {
  setCartItems((prev) => {
    // Updating cart with quantity and shopName
    const updatedCart = {
      ...prev,
      [itemId]: {
        quantity: (prev[itemId]?.quantity || 0) + quantity,
        shopName: shopName, // store the shop name with each item
      },
    };

    // Save the updated cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    // Optionally save the cart using userMobileNumber (if available)
    if (userMobileNumber) {
      localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(updatedCart));
    }

    return updatedCart;
  });

  if (userMobileNumber) {
    try {
      const response = await axios.post(`${url}/api/cart/add`, {
        mobileOrEmail: userMobileNumber,
        productId: itemId,
        quantity,
      });
      console.log('Cart updated in the database:', response.data);
    } catch (error) {
      console.error('Error updating cart in DB:', error);
      // Assuming 404 or "not found" means the item doesn't exist
      if (error.response?.status === 404 || error.response?.data?.message === 'Item not found') {
        clearCartFromLocalStorage();
      }
    }
  }
};

const removeFromCart = async (itemId) => {
  setCartItems((prev) => {
    const updatedCart = { ...prev };
    if (updatedCart[itemId] > 1) {
      updatedCart[itemId] -= 1;
    } else {
      delete updatedCart[itemId];
    }
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    if (userMobileNumber) {
      localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(updatedCart));
    }
    return updatedCart;
  });

  if (userMobileNumber) {
    try {
      const response = await axios.post(`${url}/api/cart/remove`, {
        mobileOrEmail: userMobileNumber,
        productId: itemId,
      });
      console.log('Cart updated in the database:', response.data);
    } catch (error) {
      console.error('Error updating cart in DB:', error);
      if (error.response?.status === 404 || error.response?.data?.message === 'Item not found') {
        clearCartFromLocalStorage();
      }
    }
  }
};

// Fetch and set the cart items when the userMobileNumber changes
useEffect(() => {
  if (!userMobileNumber) {
    console.warn("⚠️ userMobileNumber is undefined. Cart fetch skipped.");
    return;
  }

  const formatCartArrayToObject = (items) => {
    const formatted = {};
    items.forEach(item => {
      formatted[item.productId] = item.quantity;
    });
    return formatted;
  };

  const isCartDifferent = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  const fetchAndSetCart = async () => {
    try {
      console.log("📡 Fetching cart for:", userMobileNumber);

      const response = await axios.post(`${url}/api/cart/get`, {
        mobileOrEmail: userMobileNumber,
      });

      const items = response.data?.cart?.items || [];
      const formattedCart = formatCartArrayToObject(items);

      const localCart = JSON.parse(localStorage.getItem("cartItems")) || {};

      if (isCartDifferent(formattedCart, localCart)) {
        console.log("🔄 Updating local cart with backend data");
        localStorage.setItem("cartItems", JSON.stringify(formattedCart));
        localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(formattedCart));
        setCartItems(formattedCart);
      } else {
        console.log("✅ Local cart is already in sync");
        setCartItems(localCart); // Still set to ensure React state is synced
      }

    } catch (err) {
      console.error("❌ Error fetching cart:", err);

      // If backend fails, try fallback to saved localStorage
      const savedCart = localStorage.getItem(`cartItems_${userMobileNumber}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
        console.log("🛠️ Loaded cart from local fallback");
      }
    }
  };

  fetchAndSetCart();
}, [userMobileNumber]);


useEffect(() => {
  if (!userMobileNumber) return;

  const guestCart = JSON.parse(localStorage.getItem("cartItems")) || {};
  const userCart = JSON.parse(localStorage.getItem(`cartItems_${userMobileNumber}`)) || {};

  const hasGuestItems = Object.keys(guestCart).length > 0;
  const hasUserItems = Object.keys(userCart).length > 0;

  if (hasGuestItems && !hasUserItems) {
    setCartItems(guestCart);
    localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(guestCart));
  } else {
    setCartItems(userCart);
  }
}, [userMobileNumber]);

  const setShopNameForItem = (itemId, shopName) => {
    setShopNames((prev) => {
      const updatedShopNames = { ...prev, [itemId]: shopName };
      localStorage.setItem("shopNames", JSON.stringify(updatedShopNames));
      return updatedShopNames;
    });
  };

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

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${url}/api/orders/userorders`,
        { userId: userId || token },
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

  const logoutUser = () => {
    setToken("");
    setUserId("");
    setUserMobileNumber("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("mobileOrEmail");
    localStorage.removeItem("userMobileNumber");
    setCartItems({});
    setOrders([]);
    setWalletBalance(0);
    setTransactionHistory([]);
  };

  const applyPromoCode = (code) => {
    if (code === "DISCOUNT10") {
      setPromoCode(code);
      setDiscountApplied(true);
    } else {
      setPromoCode("");
      setDiscountApplied(false);
    }
  };

  useEffect(() => {
    if (userMobileNumber) {
      const savedCart = localStorage.getItem(`cartItems_${userMobileNumber}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [userMobileNumber]);
  
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
          groupedItems[shopName].push({ ...item, quantity });
        }
      }
    });
    return groupedItems;
  };

  const placeOrderWithWallet = async (orderData) => {
    if (!token || !userId) return;
    try {
      const response = await axios.post(
        `${url}/api/orders/place-order-wallet`,
        { ...orderData, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        handleWalletPaymentSuccess();
      } else {
        notify(response.data.message || "Failed to place wallet order", "error");
      }
    } catch (error) {
      console.error("Wallet order error:", error.message);
      notify("Something went wrong with wallet payment", "error");
    }
  };

  const handleWalletPaymentSuccess = () => {
    clearCart();
    setOrderPlaced(true);
    fetchOrders();
    //fetchWalletBalance();
    notify("Order placed using Wallet!");
  };

  const notify = (msg, type = "success") => toast[type](msg);

  useEffect(() => {
    fetchFoodList();
    if (token) {
      fetchOrders();
      //fetchWalletBalance();
      //fetchTransactions();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <img src={logo} alt="Company Logo" style={styles.loader} />
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
        setCartItems,
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
        setUserId,
        setToken,
        url,
        selectedShop,
        setSelectedShop,
        shopNames,
        setShopNames,
        orders,
        setOrders,
        fetchOrders,
        clearCartFromLocalStorage,
        selectedAddress,
        setSelectedAddress,
        groupItemsByShop,
        logoutUser,
        orderPlaced,
        setOrderPlaced,
        walletBalance,
        setWalletBalance,
        transactionHistory,
        //fetchWalletBalance,
        //addToWallet,
        //fetchTransactions,
        handleWalletPaymentSuccess,
        notify,
        placeOrderWithWallet,
        setLocation,
        location
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

const styles = {
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#fff",
  },
  loader: {
    width: "100px",
    height: "100px",
    animation: "spin 1s linear infinite",
  },
};

export default StoreContextProvider;
