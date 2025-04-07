import express from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';
import User from '../models/userModel.js';
import bcryptjs from 'bcryptjs'; // Add this at the top if missing


const userRouter = express.Router();

// ✅ Existing Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// ✅ New Admin Login Route
userRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
       return res.status(401).json({ message: 'Incorrect password' });
    }


    // Success
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      user: {
        name: user.name,
        email: user.email,
        //role: user.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default userRouter;