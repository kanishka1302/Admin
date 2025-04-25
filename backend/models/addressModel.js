// models/addressModel.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    ownerMobile: { type: String, required: true }, // ✅ Add this
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true }, // Keep only one
    type: { type: String, default: "Home" },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    default: { type: Boolean, default: false }, 
  }, { timestamps: true });
  

const Address = mongoose.model("Address", addressSchema);
export default Address;
