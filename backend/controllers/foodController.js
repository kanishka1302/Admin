import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import foodModel from "../models/foodModel.js";
import Shop from "../models/shopModel.js";

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory
const uploadDir = path.join(__dirname, "../../uploads");

// ✅ Add food item
const addFood = async (req, res) => {
    console.log("Form Data:", req.body);
    console.log("Uploaded File:", req.file);
  
    const { name, description, price, category, shopId } = req.body;
    //const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    //const serverHost = process.env.SERVER_HOST || req.get("host");
    //const imageUrl =  `${req.protocol}://${serverHost}/uploads/${req.file.filename}`;
    const imageUrl = req.file.filename;
  
    // Validate required fields explicitly
    if (!name || !description || !price || !category || !shopId || !imageUrl) {
      console.log("Validation failed:", { name, description, price, category, shopId, imageUrl });
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
  
    if (isNaN(price) || Number(price) <= 0) {
      console.log("Invalid price:", price);
      return res.status(400).json({ success: false, message: "Invalid price" });
    }
  
    try {
      const food = new foodModel({
        name,
        description,
        price: Number(price),
        category,
        image: imageUrl, // just filename, or you can prefix with '/uploads/' if needed
        shopId,
      });
  
      await food.save();
      res.status(201).json({ success: true, message: "Food item added successfully!", food });
    } catch (error) {
      console.error("Error adding food:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

const listFood = async (req, res) => {
  const { query, shopId } = req.query;

  try {
    let filter = {};

    // Filter by name if 'query' is provided
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    // Filter by shopId if provided
    if (shopId) {
      filter.shopId = shopId;
    }

    // Fetch food items based on filter
    const foods = await foodModel.find(filter);  // You can add populate if needed

    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error retrieving foods:", error);
    res.status(500).json({ success: false, message: "Error retrieving foods." });
  }
};

// ✅ Remove food item (DB delete + image cleanup)
const removeFood = async (req, res) => {
    const { id } = req.params;

    try {
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }

        const imagePath = path.join(uploadDir, food.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                }
            });
        }

        await foodModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Food item removed successfully." });
    } catch (error) {
        console.error("Error deleting food:", error);
        res.status(500).json({ success: false, message: "Error deleting food." });
    }
};

export { addFood, listFood, removeFood };
