import mongoose from "mongoose";

// Define Profile Schema
const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Please provide a valid 10-digit mobile number"],
  },
});

// Create and export Profile model
const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export default Profile;
