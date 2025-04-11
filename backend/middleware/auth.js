import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
        }

        // Extract the token after "Bearer "
        const token = authHeader.split(" ")[1];

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the user ID to the request object (not modifying req.body)
        req.user = { 
            id: decoded.id,
        role: decoded.role
        };

        next(); // Proceed to the next middleware/controller
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
};

export default authMiddleware;





/*const express = require('express');
const router = express.Router();
const User = require('../../backend/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No account found' });

  res.json({ message: 'Password reset link sent (mock)' });
});

module.exports = router;*/

