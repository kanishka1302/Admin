import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// Ensure 'uploads' directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer middleware with file size limit (5MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// API Endpoints
foodRouter.get("/list", listFood);

// ⬇ Upload middleware added here
foodRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`; // Relative URL to be saved in DB

    // Add imageUrl to req.body so controller can access it
    req.body.imageUrl = imageUrl;

    await addFood(req, res);
  } catch (error) {
    console.error("Error in /add route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

foodRouter.delete("/remove/:id", async (req, res) => {
  try {
    await removeFood(req, res);
  } catch (error) {
    console.error("Error in /remove route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default foodRouter;
