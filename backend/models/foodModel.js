import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true }, // URL or local path
    category: { type: String, required: true, trim: true },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop', // Reference to the Shop model
      required: true,
    },    
    available: { type: Boolean, default: true }, // for toggling availability
  },
  { timestamps: true }
);

// Avoid model overwrite error in development
const FoodModel = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default FoodModel;
