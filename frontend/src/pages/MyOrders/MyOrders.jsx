import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visibleProgressIndex, setVisibleProgressIndex] = useState(null);
    const { url, token, currency } = useContext(StoreContext);

    // Fetch orders for the logged-in user
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                console.error("User token is missing!");
                setError("Authentication error. Please log in again.");
                return;
            }

            console.log("Fetching orders for user ID:", token);

            const response = await axios.post(
                `${url}/api/orders/userorders`,
                { userId: token },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Orders fetched:", response.data?.data);

            const fetchedData = response.data?.data || [];
            setData(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("Failed to fetch your orders. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    // Function to get current order progress percentage
    const getOrderProgress = (status) => {
        switch (status) {
            case 'Processing':
                return 33;
            case 'Out for Delivery':
                return 66;
            case 'Delivered':
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
            {!loading && !error && (
                <div className="container">
                    {Array.isArray(data) && data.length > 0 ? (
                        data.map((order, index) => (
                            <div key={index} className="my-orders-order">
                                <img src={assets.parcel_icon} alt="Parcel Icon" />
                                <p> {order.orderId || "N/A"}</p>
                                <p>
                                    {Array.isArray(order.items) && order.items.length > 0
                                        ? order.items.map((item, itemIndex) => (
                                            <span key={itemIndex}>
                                                {item.name} x {item.quantity}
                                                {itemIndex !== order.items.length - 1 && ", "}
                                            </span>
                                        ))
                                        : "No items found"}
                                </p>
                                <p>Shop: {order.shopName || "Unknown Shop"}</p>
                                <p>{currency} {(order.amount ? order.amount / 100 : 0).toFixed(2)}</p>
                                <p className="order-status">
                                    <span>&#x25cf;</span>
                                    <b>{order.status || "Unknown"}</b>
                                    <button onClick={() => handleTrackOrder(index)}>Track Order</button>
                                </p>
                                {/* Conditionally render Progress Bar */}
                                {visibleProgressIndex === index && (
                                    <div className="progress-bar">
                                        <div style={{ width: `${getOrderProgress(order.status)}%` }} className="progress"></div>
                                    </div>
                                )}
                                {visibleProgressIndex === index && (
                                    <p>Progress: {getOrderProgress(order.status)}%</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No orders found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyOrders;