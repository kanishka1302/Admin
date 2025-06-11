import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Order = () => {
  const url = 'https://admin-92vt.onrender.com'; // updated to your deployed backend
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders. Please check the backend connection.');
    }
  };

  const statusHandler = async (event, orderId) => {
  try {
    const newStatus = event.target.value;
    const response = await axios.post(`${url}/api/order/status`, {
      orderId,
      newStatus,  // Send 'newStatus' instead of 'status'
    });

    if (response.data.success) {
      // Update the orders state locally after status update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Order status updated successfully");
    } else {
      toast.error("Failed to update order status");
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error('Failed to update order status.');
  }
};
  const formatGrams = (grams) => {
  if (!grams || isNaN(grams)) return "0g";

  return grams >= 1000
    ? `${(grams / 1000).toFixed(1)}kg`
    : `${grams}g`;
};

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order_add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="Parcel Icon" />
            <div>
            <p className="order-item-shop"><b>Shop:</b> {order.shopName}</p>
              <p className="order-item-food">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name} - {formatGrams(item.quantity)}
                    {i < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
              <p className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>

              {/* 👇 Date and time display */}
              <p className="order-item-date">
                <b>Ordered At:</b> {new Date(order.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>

              {/* 👇 Order ID display */}
              <p className="order-id">
                <b>Order ID:</b> {order.orderId}
              </p>
              <p className="order-payment-method">
                <b>Payment Method:</b> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>Rs. {order.amount}</p>
            <select onChange={(e) => statusHandler(e, order._id)} value={order.status || "Order Placed"} className="status">
              <option value="Order Placed">Order Placed</option>
              <option value="Order Received">Order Received</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
