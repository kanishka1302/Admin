import React, { useState, useEffect, useRef } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewUrlRef = useRef(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Chicken",
    shopId: "",
  });

  useEffect(() => {
    // Fetch shops list on mount
    const fetchShops = async () => {
      try {
        const res = await axios.get(`${url}/api/shops/shopnames`);
        if (res.data.success) {
          const shopNames = res.data.data.map((shop) => ({
            _id: shop._id,
            shopName: shop.name,
          }));
          setShops(shopNames);
        } else {
          toast.error("Failed to load shops");
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
        toast.error("Error loading shop list");
      }
    };
    fetchShops();
  }, [url]);

  useEffect(() => {
    // Handle image preview and cleanup
    if (!image) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    // Revoke previous URL to avoid memory leaks
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = objectUrl;

    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [image]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    if (!data.name || !data.description || !data.price || !data.category || !data.shopId) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("shopId", data.shopId);
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setData({ name: "", description: "", price: "", category: "Chicken", shopId: "" });
        setImage(null);
        setPreview(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error("Error occurred while adding the product.");
    } finally {
      setLoading(false);
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
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type Here"
            required
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write Content Here"
            required
          ></textarea>
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
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="Rs.20"
              min="1"
              required
            />
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

        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
};

export default Add;
