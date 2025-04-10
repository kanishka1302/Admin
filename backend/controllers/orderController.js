import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const currency = "INR";
const deliveryCharge = 50;

// ✅ COD Order
const placeOrderCod = async (req, res) => {
  try {
    const { userId, address, items, amount, shopName } = req.body;
    if (!userId || !address || !items || !amount || !shopName) {
      return res.status(400).json({ success: false, message: "All order details are required." });
    }
    
    const orderId = await generateOrderId();

    const newOrder = new orderModel({
      userId,
      address,
      items,
      amount,
      shopName,
      orderId,
      paymentMethod: "cod",
      status: "Pending",
      payment: false,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const updatedOrders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "COD Order Placed Successfully",
      orderId,
      data: updatedOrders,
    });
  } catch (error) {
    console.error("❌ Error placing COD order:", error);
    res.status(500).json({ success: false, message: "Failed to place COD order" });
  }
};

// ✅ Razorpay Order
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, address, shopName } = req.body;

    if (!userId || !items || !address || !shopName) {
      return res.status(400).json({ success: false, message: "All order details are required." });
    }

    const orderId = await generateOrderId();

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency,
      receipt: `receipt_${orderId}`,
    });

    const newOrder = new orderModel({
      userId,
      address,
      items,
      shopName,
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
      message: "Razorpay Order Placed Successfully",
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error placing Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

// ✅ Combined Entry Point
const placeOrder = async (req, res) => {
  const { paymentMethod } = req.body;
  if (paymentMethod === "cod") {
    return placeOrderCod(req, res);
  } else {
    return placeOrderRazorpay(req, res);
  }
};

// ✅ Verify Razorpay Signature
const verifyOrder = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === signature) {
      await orderModel.findOneAndUpdate({ razorpayOrderId: orderId }, { payment: true });
      res.json({ success: true, message: "Payment Verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("❌ Error during payment verification:", error);
    res.status(500).json({ success: false, message: "Error during payment verification" });
  }
};

// ✅ List All Orders (Admin)
const listOrders = async (req, res) => {
  try {
    const { mobileNumber } = req.query;

    if (mobileNumber) {
      const user = await userModel.findOne({ mobileNumber });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const orders = await orderModel.find({ userId: user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: orders });
    }

    const orders = await orderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ✅ User Orders
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "User ID is required." });

    const query = mongoose.Types.ObjectId.isValid(userId)
      ? { userId: new mongoose.Types.ObjectId(userId) }
      : { userId };

    const orders = await orderModel.find(query).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found for this user." });
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ✅ Update Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};
const generateNewAdminOrderId = async () => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateString = `${yyyy}${mm}${dd}`; // e.g., "20250408"

    const startOfDay = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    const endOfDay = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

    // Count the number of orders created today
    const todayOrdersCount = await orderModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Generate the next sequence number for the day
    const nextOrderNumber = String(todayOrdersCount + 1).padStart(3, "0");
    const newOrderId = `NV${dateString}${nextOrderNumber}`; // e.g., "NV20250408001"

    console.log(`Generated Admin Order ID: ${newOrderId}`);
    return newOrderId;
  } catch (error) {
    console.error("Error generating Admin Order ID:", error);
    throw new Error("Failed to generate Admin Order ID");
  }
};
const generateAdminOrder = async (req, res) => {
  try {
    const { customerOrderId } = req.body;

    // Fetch the existing customer order
    const existingOrder = await orderModel.findOne({ orderId: customerOrderId });
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Customer order not found" });
    }

    // Generate a new admin-specific order ID
    const newOrderId = await generateNewAdminOrderId();

    // Clone the existing order with the new order ID
    const newAdminOrder = new orderModel({
      ...existingOrder.toObject(), // Clone all existing order details
      orderId: newOrderId, // Set the new order ID
      createdAt: new Date(), // Set the creation date to now
    });

    await newAdminOrder.save();

    res.status(201).json({
      success: true,
      message: "New admin order created successfully",
      newOrderId,
      data: newAdminOrder,
    });
  } catch (error) {
    console.error("Error generating Admin Order:", error);
    res.status(500).json({ success: false, message: "Failed to generate Admin Order" });
  }
};
export {
  placeOrder,
  placeOrderCod,
  placeOrderRazorpay,
  listOrders,
  userOrders,
  updateStatus,
  verifyOrder,
  generateAdminOrder,
};
