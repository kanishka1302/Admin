import express from "express";
import multer from "multer";
import fs from "fs";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// Ensure 'uploads' folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// API Routes
foodRouter.get("/list", listFood);
foodRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image upload failed" });
    }
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
