import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useLocation, useNavigate } from "react-router-dom";



const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleOrder, setVisibleOrder] = useState(null); // To control side drawer
  const { url, token, currency } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();


  const orderStages = ["Order Placed", "Order Received", "Out for delivery", "Delivered"];
  const stageIcons = {
  "Order Placed": assets.checkout_icon,
  "Order Received": assets.butcher_icon,
  "Out for delivery": assets.motorbike_icon,
  "Delivered": assets.tick_icon,
};

  const getOrderStageIndex = (status) => {
    if (!status) return -1;
    const normalized = status.toLowerCase();
    return orderStages.findIndex((stage) => stage.toLowerCase() === normalized);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.userId || storedUser?._id;

      const response = await axios.post(
        `${url}/api/orders/userorders`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const updatedOrders = response.data.data.reverse();
        setData(updatedOrders);
      } else {
        setError(response.data.message || "No orders found.");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrdersSilently = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.userId || storedUser?._id;

      const response = await axios.post(
        `${url}/api/orders/userorders`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const updatedOrders = response.data.data.reverse();
        setData(updatedOrders);
      }
    } catch (error) {
      console.error("Silent refresh failed:", error);
    }
  };

  const handleTrackOrder = async (order) => {
    await refreshOrdersSilently();
    setVisibleOrder(order);
  };

const formatItemQuantity = (item) => {
  const lowerName = item.name?.toLowerCase() || "";
  const qty = Number(item.quantity) || 0;

  if (lowerName.includes("egg")) {
    return `${qty} dozen`;
  }

  // ❌ Don't multiply by 500 — use the actual value directly
  const totalGrams = qty;

  return totalGrams >= 1000
    ? `${(totalGrams / 1000).toFixed(1)}kg`
    : `${totalGrams}g`;
};

  const closeDrawer = () => setVisibleOrder(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.userId || storedUser?._id;

  if (!userId || !token) {
    navigate("/"); // 👈 Redirect to home
  } else {
    fetchOrders();
  }
}, [token, navigate]);


  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      {loading && <p>Loading your orders...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && data.length === 0 && <p>No orders found.</p>}

      {!loading && !error && data.length > 0 && (
        <div className="container">
          {data.map((order, index) => (
            <div key={order._id || index} className="my-orders-order">
              <div className="order-main">
                <img src={assets.parcel_icon} alt="Parcel Icon" />
                <p>
                  Order ID: {order.orderId}<br />
                  {order.items.map((item, i) => (
                    <span key={i} className="align">
                    {item.name} - {formatItemQuantity(item)}<br />
                  </span>
                  ))}
                </p>
                <p>
                  <b>Shop Name:</b>{" "}
                  {order.items.map((item, i) => (
                    <span key={i} className="align">
                    {item.shopName || "Unknown Shop"}<br />
                    </span>
                  ))}
                </p>
                <p>
                  {currency} {order.amount?.toFixed(2) || "0.00"}
                </p>
                <p>
                  <span className="order-status-inline">
                    ● <b>{order.status || "Unknown"}</b>
                  </span>
                </p>
                <button onClick={() => handleTrackOrder(order)}>Track Order</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {visibleOrder && (
        <>
          <div className="overlay" onClick={closeDrawer}></div>
          <div className="tracking-drawer">
            <h3>Tracking Order: {visibleOrder.orderId}</h3>
            <button className="track-order-close-btn" onClick={closeDrawer}>×</button>
            <div className="order-tracking">
              {orderStages.map((stage, index) => {
                const timestamp = visibleOrder.statusTimestamps?.[stage];
                 const formattedTime = timestamp
                    ? new Date(timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : null;

                const currentStageIndex = getOrderStageIndex(visibleOrder.status);

                const isActive = index <= currentStageIndex;

                return (
                  <div
                    key={stage}
                     className={`stage ${isActive ? "active" : ""} stage-${index + 1}`}>
                     <span className="stage-icon">
                       <span className="stage-number">{index + 1}</span>
                      </span>
                      <img src={stageIcons[stage]} alt={`${stage} icon`} className="stage-icon-img"/>
                      
                    <p>
                      <span className="stage-label">{stage}</span>
                        {isActive && formattedTime && (
                          <small className="stage-timestamp"> – {formattedTime}</small>
                        )}  
                  </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
