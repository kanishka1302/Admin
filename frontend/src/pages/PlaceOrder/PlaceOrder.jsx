import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const location = useLocation(); // Access location
  const { totalAmount } = location.state || {}; // Get the total amount passed from Cart

  const [paymentMethod, setPaymentMethod] = useState("cod"); // Payment method state
  
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    zipcode: "",
    country: "India", // Default country as India
    phone: "",
  });

  const [cities, setCities] = useState([]); // State to manage city options based on selected state
  const [promoCode, setPromoCode] = useState(""); // State to manage promo code input
  const [discountApplied, setDiscountApplied] = useState(false); // State to check if discount is applied

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    setCartItems,
    currency,
    deliveryCharge,
    selectedShop, // Fetch selectedShop from StoreContext
} = useContext(StoreContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("To place an order, sign in first.");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  const stateCityMap = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati", "Kakinada", "Guntur"],
    "Telangana": ["Hyderabad", "Secunderabad", "Malkajgiri", "Ranga Reddy"],
    "Karnataka": ["Bangalore"],
    "Tamil Nadu": ["Chennai", "Madurai", "Vellore"]
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
    console.log("Updated Address Data:", data);

    if (name === "state") {
      setCities(stateCityMap[value] || []);
      setData((prevData) => ({ ...prevData, city: "" })); // Reset city when state changes
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const applyPromoCode = (code) => {
    setPromoCode(code);
    if (code === "DISCOUNT10") {
      setDiscountApplied(true);
    } else {
      setDiscountApplied(false);
    }
  };
const placeOrder = async (e) => {
    e.preventDefault();

    console.log("Address Data Before Sending:", data); // Debugging

    const orderItems = food_list
    .filter((item) => cartItems[item._id] > 0)
    .map((item) => ({ ...item, quantity: cartItems[item._id] }));
    

    const orderData = {
      userId: token,
      address: data,
      items: orderItems,
      amount: Math.round((totalAmount + deliveryCharge)), // Amount in paise
      paymentMethod: paymentMethod,
      status: "Pending",
  };


    console.log("Placing order with data:", orderData);

    if (paymentMethod === "razorpay") {
      // Existing Razorpay logic remains unchanged
      try {
        const response = await axios.post(
          `${url}/api/order/razorpay`,
          orderData,
          {
            headers: { token },
          }
        );

        if (response.data.success) {
          const options = {
            key: "rzp_test_eRSHa1kaUjMssI",
            amount: response.data.order.amount, // Amount in paise
            currency: response.data.order.currency,
            name: "NoVeg Pvt. Ltd.",
            description: "Order Payment",
            image: assets.logo, 
            order_id: response.data.order.id,
            handler: function (response) {
              alert("Payment Successful");
              navigate("/ordersuccess", { state: { orderId: response.razorpay_order_id } });
            },
            prefill: {
              name: data.firstName,
              email: data.email,
              contact: data.phone,
            },
            notes: {
              address: data.street,
            },
          };

          const loadScript = await loadRazorpayScript();
          if (!loadScript) {
            alert("Razorpay SDK failed to load");
            return;
          }

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        }
      } catch (error) {
        console.log("Error during Razorpay order placement:", error);
        toast.error("Order placement failed. Please try again later.");
      }
    } else if (paymentMethod === "cod") {
      // New COD order handling logic
      console.log("Placing COD order");

      try {
        const response = await axios.post(
            `${url}/api/order/cod`,
            orderData,
            { headers: { token } }
        );
      
      console.log("API URL:", `${url}/api/order/cod`);
      console.log("Order Data Sent:", orderData);


      if (response.data.success) {
        toast.success("COD Order placed successfully.");
        navigate("/ordersuccess", { state: { orderId: response.data.orderId } });
    } else {
        console.error("Failed to place COD order. Response:", response.data);
        toast.error("Failed to place COD order. Please try again.");
    }
} catch (error) {
    console.error("Error during COD order placement:", error.response?.data || error.message);
    toast.error("Error while placing the COD order. Please try again later.");
}
}
  };
  const setPaymentMethodHandler = (method) => {
    console.log("Payment Method selected:", method);
    setPaymentMethod(method);
};

  return (
    <div className="place-order">
      <div className="address-section">
        <h3>Enter Shipping Address</h3>
        
        <label>First Name:
          <input type="text" name="firstName" value={data.firstName} onChange={onChangeHandler} />
        </label>

        <label>Last Name:
          <input type="text" name="lastName" value={data.lastName} onChange={onChangeHandler} />
        </label>

        <label>Email:
          <input type="email" name="email" value={data.email} onChange={onChangeHandler} />
        </label>

        <label>Street:
          <input type="text" name="street" value={data.street} onChange={onChangeHandler} />
        </label>

        <label>Landmark:
          <input type="text" name="landmark" value={data.landmark} onChange={onChangeHandler} />
        </label>

        <label>City:
          <input type="text" name="city" value={data.city} onChange={onChangeHandler} />
        </label>

        <label>State:
          <input type="text" name="state" value={data.state} onChange={onChangeHandler} />
        </label>

        <label>Zip Code:
          <input type="text" name="zipcode" value={data.zipcode} onChange={onChangeHandler} />
        </label>

        <label>Phone:
          <input type="text" name="phone" value={data.phone} onChange={onChangeHandler} />
        </label>
      </div>

      <div className="right-side">
      
        <div className="payment-section">
          <h3>Choose Payment Method</h3>
          <button
    className="cod-button"
    onClick={() => setPaymentMethodHandler("cod")}
>
    Cash on Delivery
</button>

<button
    className={`razorpay-button ${paymentMethod === "razorpay" ? "active" : ""}`}
    onClick={() => setPaymentMethod("razorpay")}
>
    Razorpay
</button>

<button
    type="button"
    className="place-order-button"
    onClick={placeOrder}
>
    Place Order
</button>



        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
