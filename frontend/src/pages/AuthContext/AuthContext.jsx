import React, { createContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const history = useHistory();

    useEffect(() => {
        // Load user and cart items from local storage on initial load
        const storedUser = localStorage.getItem('user');
        const storedCartItems = localStorage.getItem('cartItems');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedCartItems) {
            setCartItems(JSON.parse(storedCartItems));
        }
    }, []);

    useEffect(() => {
        // Save user and cart items to local storage whenever they change
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [user, cartItems]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setCartItems([]);
        localStorage.removeItem('user');
        localStorage.removeItem('cartItems');
        history.push('/login');
    };

    const addToCart = (item) => {
        setCartItems([...cartItems, item]);
    };

    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, cartItems, addToCart, removeFromCart }}>{children}</AuthContext.Provider>
    );
};

export default AuthContext;
