import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true } // Add category field
});

const ShopModel = mongoose.model("Shop", shopSchema);

export default ShopModel;
