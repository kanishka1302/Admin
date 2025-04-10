import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../Context/StoreContext';
import './Shops.css';

const API_BASE_URL = "http://localhost:5000"; // Backend API base URL
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
        setSelectedShop({ name: shop.name, image: shop.image });
        navigate(`/shop-details?shopId=${shop._id}&category=${shop.category}`);
    };

    const getShopImage = (shop) => {
        if (!shop.image) return FALLBACK_IMAGE;
        const imageUrl = shop.image.startsWith("/") ? `${API_BASE_URL}${shop.image}` : `${API_BASE_URL}/uploads/${shop.image}`;
        console.log(`Image for ${shop.name}:`, imageUrl); // Debugging Log
        return imageUrl;
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
