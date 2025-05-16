import React, { useState, useEffect } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // For Image Preview
  const [shops, setShops] = useState([]); 
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Chicken",
    shopId: "",
  });

  useEffect(() => {
    // 🆕 Fetch shop list
    const fetchShops = async () => {
      try {
        const res = await axios.get(`https://admin-92vt.onrender.com/api/shops/shopnames`);
         console.log("✅ Shop fetch response:", res.data); // full response
        console.log("✅ Shops array:", res.data.data); 
        if (res.data.success) {
        const shopNames = res.data.data.map(shop => ({
          _id: shop._id,
          shopName: shop.name
        }));
        console.log("✅ Filtered shops (only _id & name):", shopNames);
        setShops(shopNames);
      }
    } catch (err) {
      console.error("❌ Failed to fetch shops", err);
      toast.error("Error loading shop list");
    }
  };
    fetchShops();
  }, []);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl); // Cleanup preview URL
    }
  }, [image]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("shopId", data.shopId);
    formData.append("image", image);

    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
      const response = await axios.post(`${BASE_URL}/api/food/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setData({ name: "", description: "", price: "", category: "Chicken", shopId:"" });
        setImage(null);
        setPreview(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error("Error occurred while adding the product.");
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={preview || assets.upload_area} alt="Upload Area" />
          </label>
          <input onChange={handleImageChange} type="file" id="image" hidden required />
        </div>

        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Type Here" required />
        </div>

        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder="Write Content Here" required></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              <option value="Chicken">Chicken</option>
              <option value="Mutton">Mutton</option>
              <option value="Eggs">Eggs</option>
              <option value="Fish">Fish</option>
              <option value="Prawns">Prawns</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input onChange={onChangeHandler} value={data.price} type="number" name="price" placeholder="Rs.20" required />
          </div>
        </div>
        <div className="add-shop flex-col">
          <p>Shop Name</p>
          <select name="shopId" onChange={onChangeHandler} value={data.shopId} required>
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.shopName}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="add-btn">Add</button>
      </form>
    </div>
  );
};

export default Add;
