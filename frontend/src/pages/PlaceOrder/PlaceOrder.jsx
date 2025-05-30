import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import orderConfirmGif from "../../assets/orderconfirmm.gif";
import DeliveryAddress from "../DeliveryAddress/DeliveryAddress";
import { safeLocalStorage } from "../../../../backend/utils/localStorageHelper";

const PlaceOrder = () => {
  const location = useLocation();
  const { totalAmount, discountApplied, promoCode } = location.state || {};
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrder, setNewOrder] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [addressList, setAddressList] = useState([]);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "India",
    phone: "",
  });

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    setCartItems,
    currency,
    deliveryCharge,
    clearCartFromLocalStorage,
    shopNames,
    selectedShop,
  } = useContext(StoreContext);

  useEffect(() => {
    setAttemptedSubmit(true);
      
        const fetchAddresses = async () => {
          const storedUser = safeLocalStorage.get("user");
          const mobileNumber = storedUser?.mobileNumber;
    
          if (!mobileNumber) {
            toast.error("Unable to fetch addresses. Please log in again.");
            return;
          }
        try {
                const response = await axios.get(`${url}/api/address/user/${mobileNumber}`);
                if (response.data) {
                  setAddressList(response.data);
                } else {
                  setAddressList([]);
                  toast.warn("No addresses found in the database.");
                }
              } catch (error) {
                console.error("Error fetching addresses:", error);
                toast.error("Failed to fetch delivery addresses. Please try again later.");
              }
            };
          fetchAddresses();
 
    const savedAddress = safeLocalStorage.get("selectedAddress");
        if (savedAddress) {
          setSelectedAddress(savedAddress);
          setData((prevData) => ({
            ...prevData,
            firstName: savedAddress.firstName || prevData.firstName,
            lastName: savedAddress.lastName || prevData.lastName,
            phone: savedAddress.mobileNumber || prevData.phone,
            street: savedAddress.address || prevData.street,
            city: savedAddress.city || prevData.city,
            state: savedAddress.state || prevData.state,
            zipcode: savedAddress.pincode || prevData.zipcode,
          }));
        }
      }, []);
    
  useEffect(() => {
    if (!token) {
      toast.error("To place an order, sign in first.");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate, orderPlaced]);

  const handleSelectAddress = (address) => {
    const firstName = address.name?.split(" ")[0] || "";
    const lastName = address.name?.split(" ")[1] || "";

    setData((prevData) => ({
      ...prevData,
      firstName: address.firstName || firstName,
      lastName: address.lastName || lastName,
      phone: address.mobileNumber || prevData.phone,
      street: address.address || prevData.street,
      city: address.city || prevData.city,
      state: address.state || prevData.state,
      zipcode: address.pincode || prevData.zipcode,
    }));

    setSelectedAddress(address);
  };

  const isFormComplete = data.firstName && data.street && data.phone;

  const placeOrder = async (e) => {
    e.preventDefault();
    
    if (addressList.length === 0) {
      toast.error("Please add a delivery address first.");
      return;
    }
    
   

    if (!isFormComplete) {
      toast.error("Please complete all required fields.");
      return;
    }

    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        ...item,
        quantity: cartItems[item._id],
        shopName: shopNames[item._id] || selectedShop?.name || "Unknown Shop",
      }));

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.userId || storedUser?._id;

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    const shopName = orderItems[0]?.shopName || selectedShop?.name || "Unknown Shop";

    const subtotal = getTotalCartAmount();
    const delivery = deliveryCharge || 50;
    const totalAmountFinal = Math.round(
      discountApplied ? (subtotal + delivery) * 0.9 : subtotal + delivery
    );
    
    const orderData = {
      userId,
      name: `${data.firstName} ${data.lastName}`,
      address: data,
      items: orderItems,
      shopName,
      amount: totalAmountFinal,
      paymentMethod,
      status: "Pending",
      promoCode: promoCode || null,
      discountApplied: discountApplied || false
    };
    

    try {
      console.log("Payload size (bytes):", JSON.stringify(orderData).length);
      console.log("Order Data:", orderData); // Optional: Helps inspect structure
      if (paymentMethod === "razorpay") {
        const response = await axios.post(`${url}/api/order/razorpay`, orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Razorpay response:", response.data); 
        if (response.data.success) {
          const options = {
            key: response.data.data.key, // Correct key
            amount: response.data.data.amount, // Correct path to amount
            currency: response.data.data.currency,
            name: "NoVeg Pvt. Ltd.",
            description: "Order Payment",
            image: assets.logo,
            order_id:  response.data.data.razorpayOrderId, 
            handler: async (response) => {
              try {
                const verifyResponse = await axios.post(`${url}/api/order/verify`, {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData,
                }, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (verifyResponse.data.success) {
                  const finalOrderId = verifyResponse.data.orderId;
                  toast.success("Payment Verified & Order Placed!");
                  setNewOrder({ ...orderData, _id: finalOrderId });
                  setOrderPlaced(true);
                  await axios.post(`${url}/api/cart/order/placed`, {
                    mobileOrEmail: storedUser?.mobileNumber || storedUser?.email,
                  }, {
                    headers: { Authorization: `Bearer ${token}` },
                  });                  
                  setTimeout(() => {
                    clearCartFromLocalStorage();
                    setCartItems({});
                    navigate("/myorders", {
                      state: { newOrder: { ...orderData, _id: finalOrderId } },
                    });
                  }, 2000);
                } else {
                  toast.error("Payment verification failed.");
                }
              } catch (err) {
                console.error("Verification error:", err);
                toast.error("Server error verifying payment.");
              }
            },
            prefill: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              contact: data.phone,
            },
            notes: { address: data.street },
          };
          console.log("opening razorpay");
          if (window.Razorpay) {
            console.log("opened");
            const razorpay = new window.Razorpay(options);
            razorpay.open();
          } else {
            console.error("Razorpay script not loaded properly.");
            toast.error("Razorpay script is not loaded. Please try again later.");
          }
        }
      } else {
        console.log("Payload size (bytes):", JSON.stringify(orderData).length);
        console.log("Order Data:", orderData); // Optional: Helps inspect structure
        const response = await axios.post(`${url}/api/order/cod`, orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          toast.success("Order placed successfully!");
          setNewOrder({ ...orderData, _id: response.data.orderId });
          setOrderPlaced(true);
          await axios.post(`${url}/api/cart/order/placed`, {
            mobileOrEmail: storedUser?.mobileNumber || storedUser?.email,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setTimeout(() => {
            clearCartFromLocalStorage();
            setCartItems({});
            navigate("/myorders", {
              state: { newOrder: { ...orderData, _id: response.data.orderId } },
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Order placement failed. Please try again.");
    }
  };

  return (
    <div className="place-order">
      {orderPlaced && newOrder ? (
        <div className="order-success">
          <img src={orderConfirmGif} alt="Order Confirmation" className="orderconfirmm-gif" />
          <h2>Order Placed Successfully! 🎉</h2>
          <p>Check your orders here</p>
          <button onClick={() => navigate("/myorders", { state: { newOrder } })}>
            My Orders
          </button>
        </div>
      ) : (
        <>
          <div className={`address-section ${!selectedAddress ? "highlight-warning" : ""}`}>
            <h3>Delivery Address</h3>

            {!selectedAddress && attemptedSubmit && (
              <p className="warning-text">⚠️ Please select a delivery address to place the order.</p>
            )}

            <DeliveryAddress onSelectAddress={handleSelectAddress} />
          </div>

          <div className="right-side">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <p>Items Total: {currency}{getTotalCartAmount()}</p>
              <p>Delivery Fee: {currency}{deliveryCharge}</p>
              <p>Total Amount: {currency}{totalAmount}</p>
            </div>

            <div className="payment-section">
              <h3>Choose Payment Method</h3>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Online Payment (UPI/Card/RazorPay)
              </label>

              {(!isFormComplete || !selectedAddress) && (
  <p className="warning-text" style={{ color: "red", marginBottom: "10px" }}>
    ⚠️ Please select a delivery address and complete required details before placing the order.
  </p>
)}

<button
  onClick={placeOrder}
  disabled={!isFormComplete || !selectedAddress}
  className={!isFormComplete || !selectedAddress ? "disabled" : ""}
>
  PLACE ORDER
</button>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlaceOrder;
