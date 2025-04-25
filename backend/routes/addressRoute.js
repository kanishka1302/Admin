import express from "express";
import Address from "../models/addressModel.js";
import Order from "../models/orderModel.js";  // Import the Order model

const addressRouter = express.Router();

// Save Address
addressRouter.post("/save", async (req, res) => {
  const { ownerId, contactAddress } = req.body;

  try {
    if (!contactAddress.ownerMobile || !contactAddress.name || !contactAddress.address) {
      return res.status(400).json({ error: "Missing required address fields." });
    }

    // Log the received data to check if _id is passed correctly
    console.log("Received address for saving:", contactAddress);

    let savedAddress;

    if (contactAddress._id) {
      // If _id exists, update the existing address
      console.log("Updating existing address with _id:", contactAddress._id);
      savedAddress = await Address.findByIdAndUpdate(
        contactAddress._id,
        { ...contactAddress, ownerMobile: contactAddress.ownerMobile },
        { new: true } // Return the updated document
      );
    } else {
      // If _id doesn't exist, create a new address
      console.log("Creating new address as _id is not provided.");
      const existingAddresses = await Address.find({ ownerId });
      let isDefault = existingAddresses.length === 0; // Set first address as default

      const newAddress = new Address({
        ...contactAddress,
        ownerId,
        ownerMobile: contactAddress.ownerMobile,
        default: isDefault,
      });
      savedAddress = await newAddress.save();
      if (isDefault) {
        await Address.updateMany(
          { ownerId, _id: { $ne: savedAddress._id } }, 
          { default: false } // Set all other addresses to non-default
        );
      }
    }

    res.json({ address: savedAddress });
  } catch (err) {
    console.error("Error saving address:", err);
    res.status(500).json({ error: "Failed to save address" });
  }
});

// Fetch addresses by owner mobile
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

// Delete address by ID
addressRouter.delete("/delete/:addressId/:mobileNumber", async (req, res) => {
  const { addressId, mobileNumber } = req.params;

  try {
    // Check if any active orders use this address
    const orders = await Order.find({ 'address._id': addressId, ownerMobile: mobileNumber });

    if (orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete address, it is being used in active orders.",
      });
    }

    // Proceed with deletion
    const deleted = await Address.findOneAndDelete({ _id: addressId, ownerMobile: mobileNumber });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found or mobile number mismatch.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting address:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
export default addressRouter;
