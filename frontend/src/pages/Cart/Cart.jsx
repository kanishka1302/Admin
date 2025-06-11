import React, { useContext, useEffect, useMemo, useState } from "react";
import "./Cart.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import LoginPopup from "../../components/LoginPopup/LoginPopup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url, // Use url from context instead of hardcoding
    currency,
    shopNames,
    selectedShop,
    token,
    loading,
    error,
    fetchFoodList,
  } = useContext(StoreContext);


  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  // 🔄 Wait until food list is loaded
   if (loading || food_list.length === 0) {
    return (
      <div className="cart-loading">
        <p>Loading cart...</p>
      </div>
    );
  }
  
  // ❌ If there's an error loading food list
  if (error) {
    return (
      <div className="cart-error">
        <p>{error}</p>
        <button onClick={fetchFoodList}>Retry</button>
      </div>
    );
  }
  useEffect(() => {
  console.log("🛒 Cart Items:", cartItems);
}, [cartItems]);
  
  // Load promoCode and discountApplied from localStorage
  useEffect(() => {
    const savedPromoCode = localStorage.getItem("promoCode");
    const savedDiscount = localStorage.getItem("discountApplied") === "true";

    if (savedPromoCode) setPromoCode(savedPromoCode);
    if (savedDiscount) setDiscountApplied(true);
    console.log("Loaded from localStorage:");
    console.log("promoCode:", savedPromoCode);
    console.log("discountApplied:", savedDiscount);
  }, []);

  // Save promoCode and discountApplied to localStorage
  useEffect(() => {
    console.log("Saving to localStorage:");
    console.log("promoCode:", promoCode);
    console.log("discountApplied:", discountApplied);

    localStorage.setItem("promoCode", promoCode);
    localStorage.setItem("discountApplied", discountApplied);
  }, [promoCode, discountApplied]);


  const handlePromoCodeChange = (e) => setPromoCode(e.target.value);

  const handlePromoSubmit = () => {
    console.log("Submitting promo code:", promoCode);
    if (promoCode.trim() === "DISCOUNT10") {
      toast.success("Promo code applied successfully!");
      setDiscountApplied(true);
    } else {
      toast.error("Invalid promo code!");
      setDiscountApplied(false);
    }
  };

  const calculateDeliveryCharge = () => (getTotalCartAmount() === 0 ? 0 : 50);

  const calculateTotalAmount = () => {
    let total = getTotalCartAmount() + calculateDeliveryCharge();
    if (discountApplied) total *= 0.9;
    return total.toFixed(2);
  };

  const handleContinueShopping = () => navigate("/");

  const handleProceedToCheckout = () => {
  if (!token) {
    setShowLoginPopup(true); // Show login if not authenticated
    return;
  }
  navigate("/order", {
    state: {
      totalAmount: calculateTotalAmount(),
      discountApplied,
      promoCode,
    },
  });
};

  const isCartEmpty = Object.keys(cartItems).every(
    (itemId) => cartItems[itemId] === 0
  );

  // Function to calculate weight based on quantity
  const getItemWeight = (item, quantity) => {
  const itemGrams = Number(item.quantity) || 0;
  const qty = Number(quantity) || 0;
  return `${itemGrams * qty}g`;
};


const { groupedItems, warnings } = useMemo(() => {
  const groups = {};
  const warn = [];

  Object.entries(cartItems).forEach(([itemId, quantity]) => {
    if (quantity > 0) {
      const item = food_list.find((food) => food._id === itemId);

      if (!item) {
        warn.push(`⚠️ Item not found in food_list for ID: ${itemId}`);
        return;
      }

      let resolvedShop =
        item.shopId?.name?.trim() ||
        item.shopName?.trim() ||
        item.shop?.trim() ||
        "Unknown Shop";

      if (resolvedShop === "Unknown Shop") {
        warn.push(`⚠️ Missing shop info for item: ${item.name}`);
        console.warn("Missing shop info for item:", item);
      }

      if (!groups[resolvedShop]) groups[resolvedShop] = [];
      groups[resolvedShop].push(item);
    }
  });

  return { groupedItems: groups, warnings: warn };
}, [cartItems, food_list]);

  // Show toast errors after render
  useEffect(() => {
    warnings.forEach((msg) => toast.error(msg));
  }, [warnings]);

  useEffect(() => {
    const storedPromoCode = localStorage.getItem("promoCode");
    const storedDiscountApplied = localStorage.getItem("discountApplied") === "true";
  
    if (storedPromoCode) {
      setPromoCode(storedPromoCode);
    }
  
    if (storedDiscountApplied) {
      setDiscountApplied(true);
    }
  }, []);

  useEffect(() => {
    if (isCartEmpty) {
      localStorage.removeItem("promoCode");
      localStorage.removeItem("discountApplied");
      setPromoCode("");
      setDiscountApplied(false);
    }
  }, [isCartEmpty]);

  return (
    <div className="cart-container">
      {isCartEmpty ? (
        <div className="empty-cart">
          <img src={assets.addCart} alt="add cart Icon" className="add-cart" />
          <h2>Your cart is empty!</h2>
          <button
            className="continue-shopping-button"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <h2>Cart Summary</h2>
          {Object.keys(groupedItems).map((shopName) => (
            <div key={shopName} className="shop-items-section">
              <h3>{shopName}</h3>
              {groupedItems[shopName].map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-details">
                    <img
                      src={item.image} // since it's already a base64 string
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <p>{item.name}</p>
                    <p>Price: {currency}{(item.price * cartItems[item._id]).toFixed(2)}</p>
                    <p>Quantity: {cartItems[item._id]}</p>
                    <p>Weight: {getItemWeight(item, cartItems[item._id] ?? 0)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="remove-button"
                    >
                      -
                    </button>
                    <button
                      onClick={() => addToCart(item._id)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="promo-code-section">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={handlePromoCodeChange}
              className="promo-input"
            />
            <button onClick={handlePromoSubmit} className="apply-promo-button">
              Apply
            </button>
          </div>

          <div className="cart-summary">
            <p>Subtotal: {currency}{getTotalCartAmount().toFixed(2)}</p>
            <p>Delivery Charge: {currency}{calculateDeliveryCharge().toFixed(2)}</p>
            {discountApplied && <p>Discount: 10% off</p>}
            <h3>Total: {currency}{calculateTotalAmount()}</h3>
          </div>

          <div className="cart-actions">
            <button
              onClick={handleContinueShopping}
              className="continue-shopping-button"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleProceedToCheckout}
              className="checkout-button"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
      {showLoginPopup && <LoginPopup setShowLogin={setShowLoginPopup} />}
      <ToastContainer />
    </div>
  );
};

export default Cart;
