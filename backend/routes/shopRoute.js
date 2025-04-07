import express from "express";
import multer from "multer";
import ShopModel from "../models/shopModel.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// ✅ Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ✅ API to Add a New Shop
router.post("/addshops", upload.single("image"), async (req, res) => {
    try {
        const { name, address, phone, category } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!name || !address || !phone || !category) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Validate phone number format (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: "Invalid phone number format" });
        }

        const newShop = new ShopModel({ name, address, phone, category, image });
        await newShop.save();

        res.json({ success: true, message: "Shop added successfully", data: newShop });
    } catch (error) {
        console.error("Error adding shop:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ API to List All Shops
router.get("/shops", async (req, res) => {
    try {
        const shops = await ShopModel.find({});
        res.json({ success: true, data: shops });
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ success: false, message: "Failed to fetch shops" });
    }
});

// ✅ API to Remove a Shop (Now Matches Frontend `POST /api/shops/remove`)
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

        // Remove image file if it exists
        if (shop.image) {
            const imagePath = path.join("uploads", shop.image);
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

// ✅ Serve Uploaded Images
router.use("/uploads", express.static("uploads"));

export default router;
