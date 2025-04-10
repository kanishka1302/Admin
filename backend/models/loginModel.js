import mongoose from "mongoose";

const loginSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true, // Ensure the phone number is unique
    },
    isVerified: {
      type: Boolean,
      default: false, // Indicates whether the user has verified their phone number
    },
    lastLogin: {
      type: Date,
      default: Date.now, // Automatically set the last login time
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

const Login = mongoose.model("Login", loginSchema);

export default Login; // Use ES6 export
