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
  const { url, token, currency } = useContext(StoreContext);
  const location = useLocation();
  const orderStages = ["Order Received", "Out for Delivery", "Delivered"];

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

  const handleTrackOrder = async (index) => {
    await fetchOrders(); // 👈 Fetch latest orders when button is clicked
    setVisibleProgressIndex(index === visibleProgressIndex ? null : index);
  };

  useEffect(() => {
    fetchOrders(); // Initial load
  }, []);

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
                  {order.items
                    .map((item) => `${item.name} x ${item.quantity}`)
                    .join(", ")}
                </p>
                <p>
                  <b>Shop(s):</b>{" "}
                  {order.items.map((item) => item.shopName).join(", ") ||
                    "Unknown Shop"}
                </p>
                <p>
                  {currency} {order.amount?.toFixed(2) || "0.00"}
                </p>
                <p>
                  <span>●</span>
                  <b>{order.status || "Unknown"}</b>
                </p>
                <button onClick={() => handleTrackOrder(index)}>
                  Track Order
                </button>
              </div>

              {visibleProgressIndex === index && (
                <div className="order-tracking-wrapper">
                  <div className="order-tracking">
                    {orderStages.map((stage, stageIndex) => (
                      <div
                        key={stageIndex}
                        className={`stage ${
                          getOrderStageIndex(order.status) >= stageIndex
                            ? "active"
                            : ""
                        }`}
                      >
                        <span className="stage-icon">{stageIndex + 1}</span>
                        <p>{stage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
