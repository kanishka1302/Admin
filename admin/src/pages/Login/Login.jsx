import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaEye, FaEyeSlash, FaTimes, FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useAuth } from '../../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { isLoggedIn, login } = useAuth();  // ✅ Updated here
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        console.log("🔍 useEffect triggered! isLoggedIn:", isLoggedIn);
        if (isLoggedIn) {
            console.log("✅ Navigating to /dashboard...");
            navigate('/dashboard');
        }
    }, [isLoggedIn, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch('https://admin-92vt.onrender.com/api/user/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Unexpected response format: ${text}`);
            }

            const data = await response.json();
            console.log("🔍 Backend Response:", data);

            if (data.success) {
                console.log("✅ Login successful! Updating auth state...");
                login();  // ✅ Updated here
                navigate('/dashboard');
            } else {
                console.error("❌ Login failed:", data.message);
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('🔴 Error logging in:', error);
            alert('Login failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleLogin}>
                <FaTimes className="close-btn" onClick={() => navigate('/')} />
                <h1>Login</h1>

                <div className="input-box">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <MdEmail className="icon" />
                </div>

                <div className="input-box">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {showPassword ? (
                        <FaEye className="icon" onClick={togglePasswordVisibility} />
                    ) : (
                        <FaEyeSlash className="icon" onClick={togglePasswordVisibility} />
                    )}
                </div>

                <button className="submit" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
