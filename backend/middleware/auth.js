import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import validator from 'validator';
import userModel from '../models/userModel.js';

dotenv.config();

const router = express.Router();

// 🔐 Token creator
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 📝 Register User
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already in use' });

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = createToken(user._id);
    res.status(201).json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔑 Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = createToken(user._id);
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔁 Forgot Password (mock)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) return res.status(400).json({ success: false, message: 'No account found' });

  // Simulate email sending
  res.json({ success: true, message: 'Password reset link sent (mock)' });
});

export default router;
