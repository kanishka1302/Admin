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
    const { userId, address, items, shopName, discountApplied, promoCode } = req.body;

    if (!userId || !address || !items || !shopName) {
      return res.status(400).json({ success: false, message: "All order details are required." });
    }

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;

    const orderId = await generateOrderId();

    const newOrder = new orderModel({
      userId,
      address,
      items,
      amount: totalAmount,
      shopName,
      orderId,
      paymentMethod: "cod",
      status: "Order Received",
      payment: false,
      discountApplied,
      promoCode,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const io = req.app.get("io");
    io.emit("new-order", newOrder);

    res.status(200).json({
      success: true,
      message: "COD Order Placed Successfully",
      orderId,
      data: newOrder,
    });
  } catch (error) {
    console.error("❌ Error placing COD order:", error);
    res.status(500).json({ success: false, message: "Failed to place COD order" });
  }
};

// ✅ Razorpay Order
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, address, items, shopName, discountApplied, promoCode } = req.body;

    if (!userId || !items || !address || !shopName) {
      return res.status(400).json({ success: false, message: "All order details are required." });
    }
    const deliveryCharge = 40;
    const currency = "INR"; 

    const totalAmountInRupees = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;

    if (totalAmountInRupees <= 0) {
      return res.status(400).json({ success: false, message: "Total amount must be greater than 0." });
    }

    const totalAmountInPaise = totalAmountInRupees * 100;
    const orderId = await generateOrderId();

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmountInPaise,
      currency,
      receipt: `receipt_${orderId}`,
    });

    res.status(200).json({
      success: true,
      message: "Razorpay order initialized",
      data: {
        key: process.env.RAZORPAY_KEY_ID,    
        orderId: orderId,                     
        razorpayOrderId: razorpayOrder.id,     
        amount: razorpayOrder.amount,          
        currency: razorpayOrder.currency,     
      },
    });
  } catch (error) {
    console.error("❌ Error initializing Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error initializing order" });
  }
};

// ✅ Entry Point
const placeOrder = async (req, res) => {
  const { paymentMethod } = req.body;
  switch (paymentMethod) {
    case "cod":
      return placeOrderCod(req, res);
    case "razorpay":
      return placeOrderRazorpay(req, res);
    default:
      return res.status(400).json({ success: false, message: "Invalid payment method" });
  }
};

// ✅ Verify Razorpay Payment
const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, address, items, shopName, discountApplied, promoCode } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;
    const orderId = await generateOrderId();

    const newOrder = new orderModel({
      userId,
      address,
      items,
      amount: totalAmount,
      shopName,
      orderId,
      paymentMethod: "razorpay",
      status: "Order Received",
      payment: true,
      razorpayOrderId: razorpay_order_id,
      discountApplied,
      promoCode,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const io = req.app.get("io");
    io.emit("new-order", newOrder);

    res.json({
      success: true,
      message: "Payment verified and order placed.",
      orderId,
      paymentId: razorpay_payment_id,
      data: newOrder,
    });
  } catch (error) {
    console.error("❌ Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
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
    if (!orders.length) return res.status(404).json({ success: false, message: "No orders found." });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ✅ Update Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    const io = req.app.get("io");
    io.emit("orderStatusUpdated", {
      _id: order._id,
      status: order.status,
    });

    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

// ✅ Update Progress
const updateOrderProgress = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).json({ success: false, message: "Order ID and new status are required." });
    }

    const order = await orderModel.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.status = newStatus;
    await order.save();

    const io = req.app.get("io");
    io.emit("orderStatusUpdated", {
      orderId: order.orderId,
      status: newStatus,
    });

    res.json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      data: order,
    });
  } catch (error) {
    console.error("❌ Error updating order progress:", error);
    res.status(500).json({ success: false, message: "Failed to update order progress" });
  }
};

// ✅ Generate Admin Order
const generateAdminOrder = async (req, res) => {
  try {
    const { customerOrderId } = req.body;

    const existingOrder = await orderModel.findOne({ orderId: customerOrderId });
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Customer order not found" });
    }

    const newOrderId = await generateOrderId();

    const newAdminOrder = new orderModel({
      ...existingOrder.toObject(),
      _id: undefined,
      orderId: newOrderId,
      createdAt: new Date(),
    });

    await newAdminOrder.save();

    res.status(201).json({
      success: true,
      message: "New admin order created successfully",
      newOrderId,
      data: newAdminOrder,
    });
  } catch (error) {
    console.error("❌ Error generating Admin Order:", error);
    res.status(500).json({ success: false, message: "Failed to generate Admin Order" });
  }
};

export {
  placeOrder,
  placeOrderCod,
  placeOrderRazorpay,
  listOrders,
  userOrders,
  updateOrderProgress,
  verifyOrder,
  generateAdminOrder,
  updateOrderStatus,
};
