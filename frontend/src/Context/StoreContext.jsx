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
  

  { /* useEffect(() => {
    if (userMobileNumber) {
      console.log("📡 Fetching cart for:", userMobileNumber);
  
      localStorage.removeItem("cartItems");
      localStorage.removeItem(`cartItems_${userMobileNumber}`);
  
      axios.post(`${url}/api/cart/get`, { mobileOrEmail: userMobileNumber })
        .then((response) => {
          console.log("✅ Cart fetch successful:", response.data);
  
          if (response.data?.cart) {
            setCartItems(response.data.cart.items);
            localStorage.setItem("cartItems", JSON.stringify(response.data.cart.items));
            console.log("💾 Cart data stored in localStorage");
          } else {
            console.warn("⚠️ Cart data not found for this user");
          }
        })
        .catch((err) => {
          console.error("❌ Error fetching cart:", err);
        });
    } else {
      console.warn("⚠️ userMobileNumber is undefined or null, cart data will not be fetched.");
    }
  }, [userMobileNumber]); 
  
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
  }, []); */ }

  // 🛒 Cart logic
const getTotalCartAmount = () => {
  return Object.entries(cartItems).reduce((total, [id, quantity]) => {
    const item = food_list.find((food) => food._id === id);
    return total + (item?.price || 0) * quantity;
  }, 0);
};

const addToCart = async (itemId, quantity = 1, shopName = null) => {
  setCartItems((prev) => {
    console.log(`🛒 addToCart called with itemId: ${itemId}, quantity: ${quantity}`);
    const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + quantity };
    console.log("🗂 Updated cartItems state:", updatedCart);

    // Save cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    if (userMobileNumber) {
      localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(updatedCart));
      console.log(`💾 Saved to localStorage for user ${userMobileNumber}`);
    }

    // Also store shop name if provided
    if (shopName) {
      setShopNames((prev) => {
        const updatedShopNames = { ...prev, [itemId]: shopName };
        localStorage.setItem("shopNames", JSON.stringify(updatedShopNames));
        return updatedShopNames;
      });
    }

    // Send to backend
    if (userMobileNumber) {
      axios.post(`${url}/api/cart/add`, {
        mobileOrEmail: userMobileNumber,
        productId: itemId,
        quantity,
      })
      .then((response) => {
        console.log('✅ Cart updated in the database:', response.data);
      })
      .catch((error) => {
        console.error('❌ Error updating cart in DB:', error);
      });
    }

    return updatedCart;
  });
};

const removeFromCart = async (itemId) => {
  console.log(`🛒 removeFromCart called for itemId: ${itemId}`);
  setCartItems((prev) => {
    const updatedCart = { ...prev };

    if (updatedCart[itemId] > 1) {
      updatedCart[itemId] -= 1;
    } else {
      delete updatedCart[itemId];
    }

    console.log("🗂 Updated cartItems after removal:", updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    if (userMobileNumber) {
      localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(updatedCart));
    }

    if (userMobileNumber) {
      axios.post(`${url}/api/cart/remove`, {
        mobileOrEmail: userMobileNumber,
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


const clearCartLocallyOnly = () => {
  console.log("🧹 Clearing cart locally only");

  setCartItems({});
  setPromoCode("");
  setDiscountApplied(false);
  localStorage.removeItem("cartItems");

  if (userMobileNumber) {
    localStorage.removeItem(`cartItems_${userMobileNumber}`);
  }
};

// Fetch and set the cart items when the userMobileNumber changes
useEffect(() => {
  const fetchAndSetCart = async () => {
    if (!userMobileNumber) {
      console.warn("⚠️ userMobileNumber is undefined. Cart fetch skipped.");
      return;
    }
    if (hasFetchedCart.current) return; // Avoid fetching again if already fetched

    try {
      console.log("📡 Fetching cart for:", userMobileNumber);
      
      // Fetch cart from backend
      const response = await axios.post(`${url}/api/cart/get`, { mobileOrEmail: userMobileNumber});
      
      if (
        response.data &&
        response.data.cart &&
        Array.isArray(response.data.cart.items) &&
        response.data.cart.items.length > 0
      ) {
        const formattedCart = formatCartArrayToObject(response.data.cart.items);
        localStorage.setItem("cartItems", JSON.stringify(formattedCart));
        setCartItems(formattedCart);
        console.log("💾 Cart data stored in localStorage");
      } else {
        const savedCart = localStorage.getItem(`cartItems_${userMobileNumber}`);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }      

      // Set flag after fetch
      hasFetchedCart.current = true;
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
    }
  };

  fetchAndSetCart();
}, [userMobileNumber]);  // Ensure that userMobileNumber is available when this runs


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

useEffect(() => {
  const savedShopNames = localStorage.getItem("shopNames");
  if (savedShopNames) {
    setShopNames(JSON.parse(savedShopNames));
  }
}, []);


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

   // 💸 Wallet Function
   const fetchWalletBalance = async () => {
    if (!userId) return;  // Make sure userId is available

    try {
      const res = await axios.get(`${url}/api/wallet/total/${userId}`);
      console.log("✅ Wallet total response:", res.data); // Debug line
      setWalletBalance(res.data.totalCreditedAmount || 0);
    } catch (err) {
      console.error("Error fetching wallet balance:", err.message);
    }
  };
   // Fetch wallet balance whenever userId changes
   useEffect(() => {
    if (userId) {
      fetchWalletBalance();
    }
  }, [userId]);
  
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
        //fetchTransactions();
        notify("Amount added to wallet!");
      }
    } catch (err) {
      console.error("Error adding to wallet:", err.message);
    }
  };

  { /*const fetchTransactions = async () => {
    if (!token || !userId) return;
    try {
      const res = await axios.get(`${url}/api/wallet/transactions/${userId}`);
      if (res.data.success) {
        setTransactionHistory(res.data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err.message);
    }
  }; */}

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
        clearCartLocallyOnly,
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
        addToWallet,
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
