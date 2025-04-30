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

// Path for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(cors({ origin: "*" }));
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

// ✅ Razorpay Order Creation
app.post("/api/order/razorpay", async (req, res) => {
  try {
    const { address, items, amount, userId, shopName, discountApplied, promoCode } = req.body;

    // Validation for required fields
    if (!userId || !address || !items || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const deliveryCharge = 50;
    const currency = "INR";

    // Calculate total amount based on items and add delivery charge
    const totalAmountInRupees = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;

    if (totalAmountInRupees <= 0) {
      return res.status(400).json({ success: false, message: "Total amount must be greater than 0." });
    }

    // Convert total amount to paise for Razorpay (1 INR = 100 paise)
    const totalAmountInPaise = totalAmountInRupees * 100;

    // Generate order ID for your system
    const orderId = await generateOrderId();

    // Create the Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmountInPaise, // Use calculated amount
      currency: currency,
      receipt: `order_rcptid_${orderId}`, // Use the generated orderId
      notes: {
        address: JSON.stringify(address),
        items: JSON.stringify(items),
      },
    });
    // Send response with Razorpay order details
    res.json({
      success: true,
      message: "Razorpay order initialized",
      data: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });

  } catch (err) {
    console.error("Error creating Razorpay order:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});


// ✅ Razorpay Payment Verification
// ✅ Razorpay Payment Verification
app.post("/api/order/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // sent from frontend
    } = req.body;

    // ✅ Verify the signature
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    // ✅ Generate your custom NV order ID
    const customOrderId = await generateOrderId();

    // ✅ Create and save the order (only now, after payment is verified)
    const newOrder = new orderModel({
      ...orderData,
      orderId: customOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      payment: true,
      status: "Payment Successful",
    });

    await newOrder.save();

    // ✅ Notify admin
    io.emit("new-order", newOrder);

    // ✅ Send response
    res.json({
      success: true,
      msg: "Payment verified and order placed successfully!",
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

    // ✅ Notify admin in real-time
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

app.post("/api/login/create", async (req, res) => {
  const { phoneNumber, verificationId } = req.body;
  console.log("OTP requested for:", phoneNumber, "Verification ID:", verificationId);
  res.status(200).json({ message: "OTP request logged" });
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

// ✅ Socket.IO Server Setup
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "https://frontend-31u7.onrender.com", // Change to frontend URL in production
    methods: ["GET", "POST"],
  },
});

// ✅ Handle socket connections
io.on("connection", (socket) => {
  console.log("🔥 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  // Custom listener (if needed)
  socket.on("order-placed", (data) => {
    console.log("📦 Order received via socket:", data);
    io.emit("new-order", data); // Broadcast to all
  });
});

// ✅ Start Server
server.listen(port, () => {
  console.log(`🚀 Server with Socket.IO running at http://localhost:${port}`);
});
