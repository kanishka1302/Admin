import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useLocation } from "react-router-dom";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleProgressIndex, setVisibleProgressIndex] = useState(null);
  const { url, token, currency, shopNames } = useContext(StoreContext);
  const location = useLocation();
  const newOrder = location.state?.newOrder; // Get the newly placed order from PlaceOrder

  const fetchOrders = async () => {
    try {
        setLoading(true);
        setError(null);

        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.userId || storedUser?._id;

        if (!userId) {
            setError("User details are missing. Please log in again.");
            return;
        }

        // Fetch orders from the backend
        const response = await axios.post(
            `${url}/api/orders/userorders`,
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
            console.log("Fetched Orders:", response.data.data); // ✅ Debugging

            // Ensure shopName is included for each item
            const updatedOrders = response.data.data.map((order) => ({
                ...order,
                items: order.items.map((item) => ({
                    ...item,
                    shopName: item.shopName || "Unknown Shop", // ✅ Ensure shopName is set
                })),
            }));

            setData(updatedOrders);
        } else {
            setData([]);
            setError(response.data.message || "No orders found.");
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch your orders. Please try again later.");
    } finally {
        setLoading(false);
    }
};

  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  

  const getOrderProgress = (status) => {
    switch (status) {
      case "Processing":
        return 33;
      case "Out for Delivery":
        return 66;
      case "Delivered":
        return 100;
      default:
        return 0;
    }
  };

  const handleTrackOrder = (index) => {
    setVisibleProgressIndex(index === visibleProgressIndex ? null : index);
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      {loading && <p>Loading your orders...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && data.length === 0 && <p>No orders found.</p>}
      {!loading && !error && data.length > 0 && (
        <div className="container">
          {data.map((order, index) => {
            const orderId = `NV2025-${String(index + 1).padStart(3, "0")}`;
            return (
              <div key={order._id || index} className="my-orders-order">
                <img src={assets.parcel_icon} alt="Parcel Icon" />
                <p>
                  {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")} (Order ID: {orderId})
                </p>
                <p><b>Shop(s):</b> {order.items.map((item) => item.shopName).join(", ") || "Unknown Shop"}</p>
                <p>{currency} {order.amount?.toFixed(2) || "0.00"}</p>
                <p>
                  <span>●</span>
                  <b>{order.status || "Unknown"}</b>
                </p>
                {visibleProgressIndex === index && (
                  <div className="progress-bar">
                    <div
                      style={{ width: `${getOrderProgress(order.status)}%` }}
                      className="progress"
                    />
                  </div>
                )}
                {visibleProgressIndex === index && (
                  <p>Progress: {getOrderProgress(order.status)}%</p>
                )}
                <button onClick={() => handleTrackOrder(index)}>Track Order</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
