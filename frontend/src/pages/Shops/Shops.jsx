import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import './Shops.css';

const API_BASE_URL = "https://admin-92vt.onrender.com"; // Backend API base URL
const FALLBACK_IMAGE = "/assets/default-shop.png"; // Default fallback image

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedCategory = params.get('category')?.toLowerCase(); // Get category from query params
    const { setSelectedShop } = useContext(StoreContext);

    useEffect(() => {
        const fetchShops = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/shops/shops`);
                console.log("Fetched Shops:", response.data); // Debugging Log

                if (response.data.success) {
                    setShops(response.data.data || []);
                } else {
                    toast.error("Failed to load shops.");
                }
            } catch (error) {
                console.error("Error fetching shops:", error.response || error);
                toast.error("Error fetching shop data.");
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    const filteredShops = selectedCategory
        ? shops.filter(shop => shop.category?.toLowerCase() === selectedCategory)
        : shops;

    const handleShopClick = (shop) => {
        console.log("Navigating to shop:", shop); // Debugging Log
        const selectedShopData = { name: shop.name, image: shop.image };

        setSelectedShop(selectedShopData);
        localStorage.setItem("selectedShop", JSON.stringify(selectedShopData)); 
        
        navigate(`/shop-details?shopId=${shop._id}&category=${shop.category}`);
    };

   const getShopImage = (shop) => {
        if (!shop.image) return FALLBACK_IMAGE;
        if (shop.image.startsWith("data:image")) return shop.image; // It's a base64 image
        return `${API_BASE_URL}/uploads/${shop.image}`; // Fallback for older file-based images
    };


    const categoryIcons = {
        chicken: '🍗',
        fish: '🐟',
        mutton: '🥩',
        prawns: '🍤',
        eggs: '🥚',
    };

    return (
        <div className="shops-page">
            {selectedCategory && (
                <h2 className="category-heading">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Shops Near You
                    <span className="food-symbols">{categoryIcons[selectedCategory] || ''}</span>
                </h2>
            )}
            <div className="shops-container">
                {loading ? (
                    <p>Loading...</p>
                ) : filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <div key={shop._id} className="shop-card">
                            <img
                                src={getShopImage(shop)}
                                alt={shop.name}
                                className="shop-image"
                                onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                            />
                            <h3 className="shop-name">{shop.name}</h3>
                            <p className="shop-address">{shop.address}</p>
                            <button
                                aria-label={`Buy from ${shop.name}`}
                                className="shop-buy-button"
                                onClick={() => handleShopClick(shop)}
                            >
                                Buy from here
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No shops available in this category.</p>
                )}
            </div>
        </div>
    );
};

export default Shops;
