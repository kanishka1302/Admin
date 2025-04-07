import React, { useEffect, useState, useCallback } from 'react';
import './Shops.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const url = "https://admin-92vt.onrender.com"; // Base URL for backend

    // Fetch the list of shops from the API
    const fetchShops = useCallback(async () => {
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
            console.error('Fetch Shops Error:', error);
            toast.error("An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    }, []);

    // Remove a shop by its ID
    const removeShop = async (shopId) => {
        try {
            const response = await axios.post(`${url}/api/shops/remove`, { id: shopId });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchShops(); // Refresh the shop list after removal
            } else {
                toast.error("Error removing shop");
            }
        } catch (error) {
            console.error('Remove Shop Error:', error.response?.data || error.message);
            toast.error("An error occurred while removing shop");
        }
    };

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);

    // Filter shops based on the selected category
    const filteredShops = selectedCategory === "All"
        ? shops
        : shops.filter(shop => shop.category.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <div className='shops_add_flex-col'>
            <p>All Shops List</p>

            {/* Category Filter */}
            <div className="filter-container">
                <label htmlFor="categoryFilter">Filter by Category: </label>
                <select
                    id="categoryFilter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Chicken">Chicken</option>
                    <option value="Mutton">Mutton</option>
                    <option value="Fish">Fish</option>
                    <option value="Prawns">Prawns</option>
                    <option value="Eggs">Eggs</option>
                </select>
            </div>

            <div className='shops-table'>
                <div className="shops-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Address</b>
                    <b>Phone Number</b>
                    <b>Category</b>
                    <b>Action</b>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : filteredShops.length > 0 ? (
                    filteredShops.map((item, index) => {
                        const imageUrl = item.image ? `${url}/uploads/${item.image}` : "/default-shop.png";
                        return (
                            <div key={item._id} className='shops-table-format'>
                                <img 
                                    src={imageUrl} 
                                    alt={item.name} 
                                    onError={(e) => e.target.src = "/default-shop.png"} 
                                />
                                <p>{item.name}</p>
                                <p>{item.address}</p>
                                <p>{item.phone}</p>
                                <p>{item.category}</p>
                                <p className='cursor' onClick={() => removeShop(item._id)}>x</p>
                            </div>
                        );
                    })
                ) : (
                    <p>No shops available in this category.</p>
                )}
            </div>
        </div>
    );
};

export default Shops;
