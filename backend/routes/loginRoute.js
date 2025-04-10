import express from "express";
import { createLogin, verifyLogin, getAllLogins, checkUserExists} from "../controllers/loginController.js"; // Import controller functions

const router = express.Router();

// Route to create a new login record
router.post("/create", createLogin);

// Route to verify a login (e.g., OTP verification)
router.post("/verify", verifyLogin);

// Route to get all login records (for admin or testing)
router.get("/", getAllLogins);

// Route for checking if user exists
router.post("/check", checkUserExists);


export default router;
