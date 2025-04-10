import Profile from "../models/profileModel.js"; 
import Order from "../models/orderModel.js"; 

// ✅ Fetch orders for a specific user profile
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("API received userId:", userId); // ✅ Debugging

    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({ message: "User ID is missing or invalid in the request." });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// ✅ Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profiles", error });
  }
};

// ✅ Get a single profile by ID
export const getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await Profile.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error });
  }
};

// ✅ Create a new profile
export const createProfile = async (req, res) => {
  const { name, email, mobileNumber } = req.body;
  try {
    const newProfile = new Profile({ name, email, mobileNumber });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: "Failed to create profile", error });
  }
};

// ✅ Update a profile by ID
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedProfile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: "Failed to update profile", error });
  }
};

// ✅ Delete a profile by ID
export const deleteProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProfile = await Profile.findByIdAndDelete(id);
    if (!deletedProfile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete profile", error });
  }
};

// ✅ Check if a profile exists by mobile number
export const checkProfile = async (req, res) => {
  const { mobileNumber } = req.body;
  try {
    const profile = await Profile.findOne({ mobileNumber });
    res.status(200).json({ exists: !!profile, profile });
  } catch (error) {
    res.status(500).json({ message: "Error checking profile", error });
  }
};
