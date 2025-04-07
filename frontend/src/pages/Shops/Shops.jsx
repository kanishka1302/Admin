import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Shops.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';

const url = "http://localhost:4000"; // Backend API base URL

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedCategory = params.get('category'); // Get selected category from query params
    const { setSelectedShop } = useContext(StoreContext); // Get the setSelectedShop function

    // Fetch shop data from backend API
    const fetchShops = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/shops/shops`);
            console.log('Fetched Shops Response:', response.data);

            if (response.data.success) {
                setShops(response.data.data);
            } else {
                toast.error("Error fetching shops list");
            }
        } catch (error) {
            toast.error("An error occurred while fetching data");
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch shops on component mount
    useEffect(() => {
        fetchShops();
    }, []);

    // Filter shops by selected category if available
    const filteredShops = selectedCategory
        ? shops.filter(shop => shop.category.toLowerCase() === selectedCategory.toLowerCase())
        : shops;

    // Handle shop click to navigate to details page
    const handleShopClick = (shopId, category, shopName, shopImage) => {
        setSelectedShop({ name: shopName, image: shopImage });
        navigate(`/shop-details?shopId=${shopId}&category=${category}`);
    };

    const getCategorySymbol = (category) => {
        const symbols = {
            chicken: '🍗',
            fish: '🐟',
            mutton: '🥩',
            prawns: '🍤',
            eggs: '🥚',
        };
        return symbols[category.toLowerCase()] || '';
    };

    return (
        <div className="shops-page">
            {selectedCategory && (
                <h2 className="category-heading">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Shops Near You
                    <span className="food-symbols">{getCategorySymbol(selectedCategory)}</span>
                </h2>
            )}
            <div className="shops-container">
                {loading ? (
                    <p>Loading...</p>
                ) : filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <div key={shop._id} id={shop._id} className="shop-card">
                            <img src={`${url}/images/${shop.image}`} alt={shop.name} className="shop-image" />
                            <h3 className="shop-name">{shop.name}</h3>
                            <p className="shop-address">{shop.address}</p>
                            <button
                                aria-label={`Buy from ${shop.name}`}
                                className="shop-buy-button"
                                onClick={() => handleShopClick(shop._id, shop.category, shop.name, shop.image)}
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
