import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import ShopModel from "../models/shopModel.js";

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Add a New Shop with image stored as base64
router.post("/addshops", upload.single("image"), async (req, res) => {
  try {
    const { name, address, phone, category } = req.body;

    if (!name || !address || !phone || !category || !req.file) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Phone validation (10-digit)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    // Convert image buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const newShop = new ShopModel({
      name,
      address,
      phone,
      category,
      image: base64Image,
    });

    await newShop.save();

    res.json({ success: true, message: "Shop added successfully", data: newShop });
  } catch (error) {
    console.error("Error adding shop:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/shops", async (req, res) => {
  console.log("GET /api/shops/shops called");
  try {
    const shops = await ShopModel.find({});
    console.log("Found shops:", shops.length);
    res.json({ success: true, data: shops });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ success: false, message: "Failed to fetch shops" });
  }
});


// ✅ Remove Shop by ID
router.post("/remove", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Shop ID is required" });
    }

    const shop = await ShopModel.findById(id);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    // Delete associated image file
    if (shop.image) {
      const imagePath = path.join(uploadDir, shop.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await ShopModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Shop removed successfully" });
  } catch (error) {
    console.error("Error removing shop:", error);
    res.status(500).json({ success: false, message: "Failed to remove shop" });
  }
});

// ✅ Get only shop name and ID
router.get("/shopnames", async (req, res) => {
  try {
    const shops = await ShopModel.find({}, { _id: 1, name: 1 }); // Only return _id and name
    res.json({ success: true, data: shops });
  } catch (error) {
    console.error("Error fetching shop names:", error);
    res.status(500).json({ success: false, message: "Failed to fetch shop names" });
  }
});





export default router;
