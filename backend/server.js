import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { generateOrderId } from "./utils/generateOrderId.js";

// Config and DB
import { connectDB } from "./config/db.js";

// Routers
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import shopRouter from "./routes/shopRoute.js";
import walletRouter from "./routes/walletRoute.js";
import ticketRouter from "./routes/ticketRoute.js";
import locationRouter from "./routes/locationRoute.js";
import profileRouter from "./routes/profileRoute.js";
import addressRouter from "./routes/addressRoute.js";
import loginRoutes from "./routes/loginRoute.js";

// Models
import orderModel from "./models/orderModel.js";
import User from "./models/userModel.js";

// ✅ Setup
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'https://frontend-31u7.onrender.com',  // Frontend domain
  'https://admin-1-55sr.onrender.com',   // Admin domain
];

// Path for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow the origin (if it's one of the allowed origins)
      callback(null, true);
    } else {
      // Reject any other origin
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies or credentials to be sent
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static("uploads"));

// ✅ Connect to DB
connectDB();

// ✅ Razorpay Setup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay credentials missing in .env");
  process.exit(1);
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Socket.IO Server Setup
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,  // Allow only the Frontend and Admin domains
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies or credentials to be sent
  },
});

// ✅ Handle socket connections
io.on("connection", (socket) => {
  console.log("🔥 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  // Custom listener for order updates (if needed)
  socket.on("order-placed", (data) => {
    console.log("📦 Order received via socket:", data);
    io.emit("new-order", data); // Broadcast to all
  });
});

// ✅ Razorpay Order Creation
app.post("/api/order/razorpay", async (req, res) => {
  try {
    const { address, items, amount, userId, shopName, discountApplied, promoCode } = req.body;
    if (!userId || !address || !items || amount <= 0) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        address: JSON.stringify(address),
        items: JSON.stringify(items),
      },
    });

    if (!order) throw new Error("Razorpay order creation failed");

    const newOrder = new orderModel({
      userId,
      address,
      items,
      amount, // Store in rupees
      orderId: order.id,
      paymentMethod: "razorpay",
      status: "Order Received",
      payment: false,
      shopName,
      discountApplied,
      promoCode,
    });

    await newOrder.save();

    // Notify admin in real-time
    io.emit("new-order", newOrder);

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// ✅ Razorpay Payment Verification
app.post("/api/order/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    const existingOrder = await orderModel.findOne({ orderId: razorpay_order_id });
    if (!existingOrder) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const customOrderId = await generateOrderId();

    existingOrder.orderId = customOrderId;
    existingOrder.payment = true;
    await existingOrder.save();

    // Notify admin
    io.emit("new-order", existingOrder);

    res.json({
      success: true,
      msg: "Payment verified successfully!",
      orderId: customOrderId,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error verifying payment:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ✅ Cash On Delivery Order
app.post("/api/order/cod", async (req, res) => {
  try {
    const { address, items, amount, userId, shopName, discountApplied, promoCode } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const orderId = await generateOrderId();

    const newOrder = new orderModel({
      userId,
      address,
      items,
      amount,
      orderId,
      paymentMethod: "cod",
      status: "Order Received",
      payment: false,
      shopName,
      discountApplied,
      promoCode,
    });

    await newOrder.save();

    // Notify admin in real-time
    io.emit("new-order", newOrder);

    res.json({ success: true, orderId, message: "COD Order placed successfully." });
  } catch (err) {
    console.error("Error placing COD order:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Orders of a User
app.post("/api/orders/userOrders", async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// ✅ Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin") return res.status(403).json({ message: "Access denied: Not an admin" });

    const bcryptjs = await import("bcryptjs");
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({
      message: "Admin login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/shops", shopRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/location", locationRouter);
app.use("/api/profile", profileRouter);
app.use("/api/address", addressRouter);
app.use("/api/login", loginRoutes);

// ✅ Base Route
app.get("/", (req, res) => {
  res.send("✅ API Working");
});

// ✅ Catch All
app.use("*", (req, res) => {
  console.warn(`❗ Invalid route: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// ✅ Start Server
server.listen(port, () => {
  console.log(`🚀 Server with Socket.IO running at http://localhost:${port}`);
});
