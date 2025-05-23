import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// Use memoryStorage to keep file in memory buffer (no disk saving)
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

foodRouter.get("/list", listFood);

foodRouter.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // Convert file buffer to base64 data URI string
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Assign base64 string to req.body.image for the controller
    req.body.image = base64Image;

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

