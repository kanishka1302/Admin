import React, { useState } from 'react';
import './AddShop.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddShop = ({ url = "https://admin-92vt.onrender.com" }) => {
    const [image, setImage] = useState(null);

    const [data, setData] = useState({
        name: "",
        address: "",
        phone: "",
        category: "Chicken" // Default category
    });

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("address", data.address);
        formData.append("phone", data.phone);
        formData.append("image", image);
        formData.append("category", data.category); 

        // Debug the URL and form data
        console.log("API URL:", url);
        console.log("Form Data:", [...formData.entries()]);

        try {
            const response = await axios.post(`${url}/api/shops/addshops`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('API Response:', response.data);

            if (response.data.success) {
                setData({ name: "", address: "", phone: "", category: "Chicken" });
                setImage(null);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error while adding shop:", error.response ? error.response.data : error.message);
            alert("Error occurred while adding the shop.");
        }
    };

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Shop Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload Area" />
                    </label>
                    <input
                        onChange={handleImageChange}
                        type="file"
                        id="image"
                        hidden
                        required
                    />
                </div>

                <div className="add-shop-name flex-col">
                    <p>Shop Name</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name='name'
                        placeholder='Enter Shop Name'
                        required
                    />
                </div>

                <div className="add-shop-address flex-col">
                    <p>Shop Address</p>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.address}
                        name="address"
                        rows="4"
                        placeholder='Enter Shop Address'
                        required
                    />
                </div>
                <div className="add-shop-category flex-col">
                    <p>Shop Category</p>
                    <select
                    onChange={onChangeHandler}
                    name="category"
                    value={data.category}
                    required
                    >
                        <option value="Chicken">Chicken</option>
                        <option value="Mutton">Mutton</option>
                        <option value="Fish">Fish</option>
                        <option value="Prawns">Prawns</option>
                        <option value="Eggs">Eggs</option>
                        </select>
                        </div>


                <div className="add-phone-number flex-col">
                    <p>Phone Number</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.phone}
                        type="tel"
                        name='phone'
                        placeholder='Enter Phone Number'
                        required
                    />
                </div>

                <button type='submit' className='add-btn'>Add Shop</button>
            </form>
        </div>
    );
}

export default AddShop;
