import { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

export const socket = io("http://localhost:4000"); // ✅ Update for production

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000";
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedShop, setSelectedShop] = useState(() => localStorage.getItem("selectedShop") || "");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [location, setLocation] = useState(localStorage.getItem('location') || '');
  const [userMobileNumber, setUserMobileNumber] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [shopNames, setShopNames] = useState(() => JSON.parse(localStorage.getItem("shopNames")) || {});
  const currency = "₹";
  const deliveryCharge = 50;
  const hasFetchedCart = useRef(false);

  const [cartItems, setCartItems] = useState(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    return storedCartItems ? JSON.parse(storedCartItems) : {};
  });

  useEffect(() => {
    const savedMobile = localStorage.getItem("userMobileNumber");
    if (savedMobile) setUserMobileNumber(savedMobile);
  }, []);

  useEffect(() => {
    const savedShop = localStorage.getItem("selectedShop");
    if (savedShop) setSelectedShop(JSON.parse(savedShop));
  }, []);

  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem("selectedShop", JSON.stringify(selectedShop));
    }
  }, [selectedShop]);

  const formatCartArrayToObject = (items = []) =>
    items.reduce((acc, item) => {
      if (item.productId && item.quantity !== undefined) acc[item.productId] = item.quantity;
      return acc;
    }, {});

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
  };

  const addToCart = async (itemId, quantity = 1) => {
    setCartItems((prev) => {
      const updated = { ...prev, [itemId]: (prev[itemId] || 0) + quantity };
      localStorage.setItem("cartItems", JSON.stringify(updated));
      if (userMobileNumber) localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(updated));
      return updated;
    });

    if (userMobileNumber) {
      try {
        const res = await axios.post(`${url}/api/cart/add`, {
          mobileOrEmail: userMobileNumber,
          productId: itemId,
          quantity,
        });
        socket.emit("cartUpdated", { user: userMobileNumber });
      } catch (err) {
        if (err.response?.status === 404) clearCartFromLocalStorage();
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId] -= 1;
      else delete updated[itemId];

      localStorage.setItem("cartItems", JSON.stringify(updated));
      if (userMobileNumber) localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(updated));
      return updated;
    });

    if (userMobileNumber) {
      try {
        await axios.post(`${url}/api/cart/remove`, {
          mobileOrEmail: userMobileNumber,
          productId: itemId,
        });
        socket.emit("cartUpdated", { user: userMobileNumber });
      } catch (err) {
        if (err.response?.status === 404) clearCartFromLocalStorage();
      }
    }
  };

  useEffect(() => {
    if (!userMobileNumber) return;

    const fetchAndSetCart = async () => {
      try {
        const response = await axios.post(`${url}/api/cart/get`, {
          mobileOrEmail: userMobileNumber,
        });
        const backendCart = formatCartArrayToObject(response.data?.cart?.items || []);
        const localCart = JSON.parse(localStorage.getItem("cartItems")) || {};

        if (JSON.stringify(backendCart) !== JSON.stringify(localCart)) {
          localStorage.setItem("cartItems", JSON.stringify(backendCart));
          localStorage.setItem(`cartItems_${userMobileNumber}`, JSON.stringify(backendCart));
          setCartItems(backendCart);
        } else {
          setCartItems(localCart);
        }
      } catch (err) {
        const fallback = localStorage.getItem(`cartItems_${userMobileNumber}`);
        if (fallback) setCartItems(JSON.parse(fallback));
      }
    };

    fetchAndSetCart();
  }, [userMobileNumber]);

  const setShopNameForItem = (itemId, shopName) => {
    setShopNames((prev) => {
      const updated = { ...prev, [itemId]: shopName };
      localStorage.setItem("shopNames", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchFoodList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data.success) setFoodList(res.data.data);
      else throw new Error("Failed to load food list");
    } catch (err) {
      setError("❌ Failed to fetch food list");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await axios.post(`${url}/api/orders/userorders`,
        { userId: userId || token },
        { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data.success ? res.data.data : []);
    } catch (err) {
      setOrders([]);
    }
  };

  const logoutUser = () => {
    setToken("");
    setUserId("");
    setUserMobileNumber("");
    localStorage.clear();
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

  const groupItemsByShop = () => {
    const grouped = {};
    Object.entries(cartItems).forEach(([id, quantity]) => {
      if (quantity > 0) {
        const item = food_list.find((food) => food._id === id);
        if (item) {
          const shop = shopNames[id] || "Unknown Shop";
          if (!grouped[shop]) grouped[shop] = [];
          grouped[shop].push({ ...item, quantity });
        }
      }
    });
    return grouped;
  };

  const placeOrderWithWallet = async (orderData) => {
    if (!token || !userId) return;
    try {
      const res = await axios.post(`${url}/api/orders/place-order-wallet`,
        { ...orderData, userId },
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        handleWalletPaymentSuccess();
      } else {
        notify(res.data.message || "Failed to place wallet order", "error");
      }
    } catch {
      notify("Wallet payment failed", "error");
    }
  };

  const handleWalletPaymentSuccess = () => {
    clearCartFromLocalStorage();
    setOrderPlaced(true);
    fetchOrders();
    notify("Order placed via Wallet!");
  };

  const notify = (msg, type = "success") => toast[type](msg);

  useEffect(() => {
    fetchFoodList();
    if (token) fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <img src={logo} alt="Company Logo" style={styles.loader} />
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <StoreContext.Provider
      value={{
        food_list, cartItems, setCartItems, addToCart, removeFromCart,
        getTotalCartAmount, promoCode, applyPromoCode, discountApplied,
        currency, deliveryCharge, token, userId, setUserId, setToken,
        url, selectedShop, setSelectedShop, shopNames, setShopNames,
        orders, setOrders, fetchOrders, clearCartFromLocalStorage,
        selectedAddress, setSelectedAddress, groupItemsByShop,
        logoutUser, orderPlaced, setOrderPlaced, walletBalance,
        setWalletBalance, transactionHistory,
        handleWalletPaymentSuccess, notify, placeOrderWithWallet,
        setLocation, location
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
