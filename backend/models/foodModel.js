import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true }, // Stores image URL or path
    category: { type: String, required: true, trim: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "ShopModel", required: false },
    available: { type: Boolean, default: true }, // New: Track availability status
  },
  { timestamps: true }
);

// Prevent duplicate model registration issue
const FoodModel = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default FoodModel;
