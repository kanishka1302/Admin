import { createContext, useEffect, useState } from "react";
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

   useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setToken(localStorage.getItem("token") || "");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.userId || parsedUser?._id || "");
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const userMobile = localStorage.getItem("userMobile");

  useEffect(() => {
    if (userMobile) {
      axios.post(`${url}/api/cart/get`, { mobileNumber: userMobile })
        .then((res) => {
          if (res.data.success) {
            const dbCart = {};
            res.data.cart.items.forEach(item => {
              dbCart[item.productId] = item.quantity;
            });
            setCartItems(dbCart);
            localStorage.setItem("cartItems", JSON.stringify(dbCart));
            localStorage.setItem(`cartItems_${userMobile}`, JSON.stringify(dbCart));
          }
        }).catch(err => console.error("Fetch user cart error:", err));
    }
  }, [userMobile]);
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setToken(localStorage.getItem("token") || "");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.userId || parsedUser?._id || "");
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

const addToCart = async (itemId, quantity = 1) => {
  setCartItems((prev) => {
    const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + quantity };

    // Update localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    if (userId) {
      localStorage.setItem(`cartItems_${userId}`, JSON.stringify(updatedCart));
    }

    // Update shop name for the item
    if (!shopNames[itemId] && selectedShop?.name) {
      setShopNameForItem(itemId, selectedShop.name);
    }

    // Update cart in the database (only if user is logged in)
    if (userId) {
      axios.post('https://admin-92vt.onrender.com/api/cart/add', {
        mobileNumber: userId, // Assuming userId is the mobile number or a unique identifier
        productId: itemId,
        quantity,
      })
      .then((response) => {
        console.log('Cart updated in the database:', response.data);
      })
      .catch((error) => {
        console.error('Error updating cart in DB:', error);
      });
    }

    return updatedCart;
  });
};

const removeFromCart = async (itemId) => {
  setCartItems((prev) => {
    const updatedCart = { ...prev };
    
    // Remove or update item quantity in the cart
    if (updatedCart[itemId] > 1) {
      updatedCart[itemId] -= 1;
    } else {
      delete updatedCart[itemId];
    }

    // Update localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    if (userId) {
      localStorage.setItem(`cartItems_${userId}`, JSON.stringify(updatedCart));
    }

    // Update cart in the database (only if user is logged in)
    if (userId) {
      axios.post('https://admin-92vt.onrender.com/api/cart/remove', {
        mobileNumber: userId, // Assuming userId is the mobile number or unique identifier
        productId: itemId,
      })
      .then((response) => {
        console.log('Cart updated in the database:', response.data);
      })
      .catch((error) => {
        console.error('Error updating cart in DB:', error);
      });
    }

    return updatedCart;
  });
};

const clearCart = async () => {
  setCartItems({});
  setPromoCode("");
  setDiscountApplied(false);
  localStorage.removeItem("cartItems");
  if (userId) {
    localStorage.removeItem(`cartItems_${userId}`);
  }
};

useEffect(() => {
  if (userId) {
    const guestCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    const userCart = JSON.parse(localStorage.getItem(`cartItems_${userId}`)) || {};
    const mergedCart = { ...guestCart, ...userCart };
    setCartItems(mergedCart);
    localStorage.setItem("cartItems", JSON.stringify(mergedCart));
    localStorage.setItem(`cartItems_${userId}`, JSON.stringify(mergedCart));
  }
}, [userId]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
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
    if (userId) {
      const savedCart = localStorage.getItem(`cartItems_${userId}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [userId]);

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

  // 💸 Wallet Functions
  const fetchWalletBalance = async () => {
    if (!token || !userId) return;
    try {
      const res = await axios.get(`${url}/api/wallet/balance/${userId}`);
      if (res.data.success) {
        setWalletBalance(res.data.balance);
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err.message);
    }
  };

  const addToWallet = async (amount) => {
    if (!token || !userId) return;
    try {
      const res = await axios.post(
        `${url}/api/wallet/add`,
        { userId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setWalletBalance(res.data.updatedBalance);
        fetchTransactions();
        notify("Amount added to wallet!");
      }
    } catch (err) {
      console.error("Error adding to wallet:", err.message);
    }
  };

  const fetchTransactions = async () => {
    if (!token || !userId) return;
    try {
      const res = await axios.get(`${url}/api/wallet/transactions/${userId}`);
      if (res.data.success) {
        setTransactionHistory(res.data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err.message);
    }
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
    fetchWalletBalance();
    notify("Order placed using Wallet!");
  };

  const notify = (msg, type = "success") => toast[type](msg);

  useEffect(() => {
    fetchFoodList();
    if (token) {
      fetchOrders();
      fetchWalletBalance();
      fetchTransactions();
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
        setToken,
        url,
        selectedShop,
        setSelectedShop,
        shopNames,
        setShopNames,
        orders,
        setOrders,
        fetchOrders,
        clearCart,
        selectedAddress,
        setSelectedAddress,
        groupItemsByShop,
        logoutUser,
        orderPlaced,
        setOrderPlaced,
        walletBalance,
        setWalletBalance,
        transactionHistory,
        fetchWalletBalance,
        fetchWalletDetails: fetchWalletBalance, // ✅ Expose this correctly
        addToWallet,
        fetchTransactions,
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
