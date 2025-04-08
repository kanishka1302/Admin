import React, { useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const { isLoggedIn, logout, justLoggedIn, setJustLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Show toast notification when user logs in successfully
  useEffect(() => {
    if (isLoggedIn && justLoggedIn) {
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setJustLoggedIn(false);
    }
  }, [isLoggedIn, justLoggedIn]);

  const handleLogout = () => {
    logout(); // ✅ Call the context logout function
  
    toast.success('Logged out successfully!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="navbar-header">
      <div className="navbar-logo">
        <Link to="/" className="logo">
          <img className="logo-img" src={assets.noveglogo} alt="Logo" />
        </Link>
      </div>

      <div className="navbar-links">
        <p>NoVeg Admin</p>
      </div>

      <div className="navbar-button">
        {isLoggedIn ? (
          <div className="profile-logout-container">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button
            className="login-button"
            type="button"
            onClick={() => {
              navigate('/login');
              toast.info('Redirecting to login...', {
                position: 'top-right',
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
              });
            }}
          >
            Login
          </button>
        )}
      </div>

      {/* Toast Container to display notifications */}
      <ToastContainer />
    </div>
  );
};

export default Navbar;
