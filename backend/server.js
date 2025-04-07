import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import dotenv from "dotenv";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import shopRouter from "./routes/shopRoute.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "./models/orderModel.js";
import User from "./models/userModel.js"; // ✅ Needed for admin login
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cors({ origin : "*" }));

// db connection
connectDB();

// Razorpay integration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API endpoint for Razorpay order creation
app.post("/api/order/razorpay", async (req, res) => {
  try {
      console.log("Received Razorpay Order Request:", req.body);
      
      const { address, items, amount, userId } = req.body;

      if (!userId || !address || !items || !amount || isNaN(amount) || amount <= 0) {
          console.error("Invalid request data:", req.body);
          return res.status(400).json({ error: "Invalid request data" });
      }

      const amountInPaise = Math.round(amount * 100);

      const options = {
          amount: amountInPaise,
          currency: "INR",
          receipt: `order_rcptid_${Date.now()}`,
          notes: {
              address: JSON.stringify(address),
              items: JSON.stringify(items),
          },
      };

      console.log("Creating Razorpay Order with options:", options);

      const order = await razorpay.orders.create(options);
      if (!order) {
          console.error("Error creating Razorpay order");
          return res.status(500).json({ error: "Razorpay order creation failed" });
      }

      console.log("Razorpay Order Created Successfully:", order);

      const newOrder = new orderModel({
          userId,
          address,
          items,
          amount: amountInPaise,
          orderId: order.id,
          paymentMethod: "razorpay",
          status: "Pending",
          payment: false,
      });

      await newOrder.save();
      return res.json({ success: true, order });
  } catch (err) {
      console.error("Error creating Razorpay order:", err);
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.post("/api/order/cod", async (req, res) => {
  try {
      const { address, items, amount, userId } = req.body;

      if (!userId) {
          return res.status(400).json({ error: "User ID is required" });
      }

      const orderId = "COD-" + new Date().getTime();

      const newOrder = new orderModel({
          userId,
          address, // Ensure the full address object is being saved
          items,
          amount,
          orderId,
          paymentMethod: "cod",
          status: "Pending",
          payment: false,
      });

      await newOrder.save();
      res.json({ success: true, orderId, message: "COD Order placed successfully." });
  } catch (err) {
      console.error("Error placing COD order:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to verify Razorpay payment
app.post("/api/order/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    res.json({
      success: true,
      msg: "Payment verified successfully!",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// API endpoint to fetch user orders
app.post('/api/orders/userOrders', async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId: userId });

    console.log('Fetched Orders:', orders); // Log the data to check its structure

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.json({ success: false, message: 'Failed to fetch orders' });
  }
});

// ✅ Admin login route added
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Not an admin" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      message: "Admin login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API routes
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/shops", shopRouter);

// Base route for testing
app.get("/", (req, res) => {
  res.send("API Working");
});

app.use('*', (req, res) => {
  console.log(`Invalid route accessed: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// Server start
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
