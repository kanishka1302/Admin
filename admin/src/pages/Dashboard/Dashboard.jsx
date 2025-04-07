import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Dashboard.css';
import { assets } from '../../assets/assets';


const Dashboard = () => {
    return (
        <>
            <div className='dashboard-container'>
                <div className='first-row'>
                    <Link to="/Add" className='Add'>
                        <img src={assets.add_icon} alt='add' />
                        <h2>Add items</h2>
                    </Link>
                    <Link to="/AddShop" className='AddShop'>
                        <img src={assets.add_icon} alt='AddShop' />
                        <h2>AddShops</h2>
                    </Link>
                    <Link to="/List" className='List'>
                        <img src={assets.list_icon} alt='list' />
                        <h2>List</h2>
                    </Link>
                    
                </div>
                <div className='second-row'>
                    <Link to="/Orders" className='Orders'>
                        <img src={assets.order_icon} alt='Orders' />
                        <h2>Orders</h2>
                    </Link>
                    <Link to="/dashboard/shops" className='Shops'>
                        <img src={assets.shop_icon} alt='Shops' />
                        <h2>Shops</h2>
                    </Link>
                </div>
               
            </div>
        </>
    );
};

export default Dashboard;