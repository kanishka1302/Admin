import express from "express";
import Address from "../models/addressModel.js";

const addressRouter = express.Router();

// Updated to use ownerMobile + contact address
addressRouter.post("/save", async (req, res) => {
  const { ownerId, contactAddress } = req.body;
  console.log("Saved address:", savedAddress);

  try {
    let savedAddress;

    if (contactAddress._id) {
      savedAddress = await Address.findByIdAndUpdate(
        contactAddress._id,
        { ...contactAddress, ownerMobile: contactAddress.ownerMobile }, // ensure this is included
        { new: true }
      );
    } else {
      const newAddress = new Address({
        ...contactAddress,
        ownerId,
        ownerMobile: contactAddress.ownerMobile,
      });
      savedAddress = await newAddress.save();
    }
    console.log("Saving address:", contactAddress);

    res.json({ address: savedAddress });
  } catch (err) {
    console.error("Error saving address:", err);
    res.status(500).json({ error: "Failed to save address" });
  }
});

// Get addresses by owner mobile number instead of userId
addressRouter.get("/user/:mobileNumber", async (req, res) => {
  console.log("Fetching addresses for mobile:", req.params.mobileNumber);

  try {
    const addresses = await Address.find({ ownerMobile: req.params.mobileNumber });
    res.json(addresses);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});


// Get all addresses for a logged-in user
addressRouter.get("/phone/:mobileNumber", async (req, res) => {
  try {
    const user = await User.findOne({ mobileNumber: req.params.mobileNumber });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});
// GET all addresses for testing
addressRouter.get("/all", async (req, res) => {
  const addresses = await Address.find({});
  res.json(addresses);
});




export default addressRouter;
