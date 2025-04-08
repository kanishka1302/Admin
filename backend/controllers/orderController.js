import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const deliveryCharge = 50;
const currency = "INR";

// ==========================
// utils/generateOrderId.js
export const generateOrderId = async () => {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20250408

  // Get today's date in YYYYMMDD format
  const datePrefix = `NV${dateString}`;

  // Count how many orders already exist for today
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  const count = await Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });

  // Format: NVYYYYMMDD###
  const orderNumber = String(count + 1).padStart(3, '0');
  return `${datePrefix}${orderNumber}`;
};


// ==========================
// 📦 COD Order
const placeOrderCod = async (req, res) => {
  try {
    const { userId, address, shopName, items, amount } = req.body;
    const orderId = await generateOrderId();

    const newOrder = new orderModel({
      userId,
      address,
      shopName,
      items,
      amount,
      orderId,
      paymentMethod: "cod",
      payment: false,
      status: "Pending",
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orderId,
    });
  } catch (error) {
    console.error("Error placing COD order:", error);
    res.status(500).json({ success: false, message: "Failed to place COD order" });
  }
};

// ==========================
// 💳 Razorpay Order
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address, shopName } = req.body;
    const orderId = await generateOrderId();

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;

    const options = {
      amount: totalAmount * 100,
      currency,
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = new orderModel({
      userId,
      address,
      shopName,
      items,
      amount: totalAmount,
      orderId,
      paymentMethod: "razorpay",
      payment: true,
      status: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error placing Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

// ==========================
// ✅ Combined Place Order Handler
const placeOrder = async (req, res) => {
  if (req.body.paymentMethod === "cod") {
    return placeOrderCod(req, res);
  } else {
    return placeOrderRazorpay(req, res);
  }
};

// ==========================
// 📋 All Orders
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// ==========================
// 📋 User Orders
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ==========================
// 🚚 Update Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export {
  placeOrder,
  placeOrderCod,
  placeOrderRazorpay,
  listOrders,
  userOrders,
  updateStatus,
};
