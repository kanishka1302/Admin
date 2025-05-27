import express from "express";
import multer from "multer";
import sharp from "sharp";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

const storage = multer.memoryStorage();

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max upload size
});

// List all food
foodRouter.get("/list", listFood);

// Add new food
foodRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // Resize and compress image using sharp
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 500 }) // adjust width as needed (height auto)
      .webp({ quality: 40 }) // reduce quality for smaller size
      .toBuffer();

    // Convert to base64
    const base64Image = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

    // Attach to body
    req.body.image = base64Image;

    // Continue with controller
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
