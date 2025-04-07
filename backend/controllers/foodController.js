import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import foodModel from "../models/foodModel.js";

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory
const uploadDir = path.join(__dirname, "../../uploads");

// Add food item
const addFood = async (req, res) => {
    console.log("Form Data:", req.body);
    console.log("Uploaded File:", req.file);

    // Validate file upload
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    try {
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: req.file.filename,
            shopId: req.body.shopId, // Ensure shopId is saved
        });

        await food.save();
        res.status(201).json({ success: true, message: "Food item added successfully!", food });
    } catch (error) {
        console.error("Error adding food:", error);
        res.status(500).json({ success: false, message: "Error adding food." });
    }
};

// List all food items with optional search query
const listFood = async (req, res) => {
    const { query } = req.query; // Extract the search query

    try {
        // Search food by name (case insensitive) if query exists
        const filter = query ? { name: { $regex: query, $options: "i" } } : {};

        // Fetch food items from the database
        const foods = await foodModel.find(filter);
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("Error retrieving foods:", error);
        res.status(500).json({ success: false, message: "Error retrieving foods." });
    }
};

// Remove food item
const removeFood = async (req, res) => {
    const { id } = req.params; // Use params instead of body

    try {
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }

        // Delete image file if it exists
        const imagePath = path.join(uploadDir, food.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting image:", err);
            });
        }

        // Delete the food item from the database
        await foodModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Food item removed successfully." });
    } catch (error) {
        console.error("Error deleting food:", error);
        res.status(500).json({ success: false, message: "Error deleting food." });
    }
};

export { addFood, listFood, removeFood };
