import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: "rzp_test_eRSHa1kaUjMssI",
  key_secret: "YSIpihNvRXxwz5wFfKpAZgZp",
});

const deliveryCharge = 50;
const currency = "INR";

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0) + deliveryCharge;

    const options = {
      amount: totalAmount * 100,
      currency,
      receipt: `receipt_order_${newOrder._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      razorpayKey: "rzp_test_eRSHa1kaUjMssI",
      amount: totalAmount,
      currency,
    });
  } catch (error) {
    console.error("Error while creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

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

const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address, shopName, orderId } = req.body;

    const newOrder = new orderModel({
      userId,
      address,
      shopName,
      items,
      amount,
      orderId,
      paymentMethod: "razorpay",
      payment: true,
      status: "Pending",
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

const placeOrderCod = async (req, res) => {
  try {
    const { userId, address, shopName, items, amount } = req.body;

    const newOrder = new orderModel({
      userId,
      address,
      shopName,
      items,
      amount,
      orderId: `COD-${new Date().getTime()}`,
      paymentMethod: "cod",
      payment: false,
      status: "Pending",
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.status(200).json({ success: true, orderId: newOrder.orderId });
  } catch (error) {
    console.error("Error placing COD order:", error);
    res.status(500).json({ success: false, message: "Failed to place COD order" });
  }
};

export {
  placeOrder,
  listOrders,
  updateStatus,
  userOrders,
  placeOrderCod,
  placeOrderRazorpay,
};
