import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay instance
const razorpay = new Razorpay({
    key_id: "rzp_test_eRSHa1kaUjMssI",
    key_secret: "YSIpihNvRXxwz5wFfKpAZgZp"
});

// Config variables
const currency = "INR";
const deliveryCharge = 50;
const frontend_URL = 'http://localhost:5173';

/**
 * Place an order with Razorpay payment.
 */
const placeOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const totalAmount = req.body.items.reduce(
            (acc, item) => acc + item.price * item.quantity, 0
        ) + deliveryCharge;

        const options = {
            amount: totalAmount * 100, // Razorpay accepts amount in paise
            currency: currency,
            receipt: `receipt_order_${newOrder._id}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            razorpayKey: "rzp_test_eRSHa1kaUjMssI",
            amount: totalAmount,
            currency: currency,
        });
    } catch (error) {
        console.error("Error while creating order:", error);
        res.status(500).json({ success: false, message: "Error while creating order" });
    }
};

/**
 * List all orders for the admin panel.
 */
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

/**
 * Get user-specific orders.
 */
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        console.log("Fetching orders for userId:", userId);

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

/**
 * Update order status.
 */
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

/**
 * Verify Razorpay payment.
 */
const verifyOrder = async (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    try {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", "YSIpihNvRXxwz5wFfKpAZgZp") // Use your actual secret key
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === signature) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment Verified" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Error during payment verification:", error);
        res.status(500).json({ success: false, message: "Error during payment verification" });
    }
};

/**
 * Place an order with Razorpay payment confirmation.
 */
const placeOrderRazorpay = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        });

        console.log('New Order:', newOrder);
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.error("Error placing Razorpay order:", error);
        res.status(500).json({ success: false, message: "Error placing order" });
    }
};

/**
 * Place an order with Cash on Delivery (COD).
 */
const placeOrderCod = async (req, res) => {
    try {
        const { userId, address, shopName, items, amount } = req.body;

        console.log("Placing COD order with shopName:", shopName);

        const newOrder = new orderModel({
            userId,
            address,
            items,
            amount,
            shopName,
            orderId: `COD-${new Date().getTime()}`,
            paymentMethod: "cod",
            status: "Pending",
            payment: false,
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        const orderId = `COD-${newOrder._id}`;
        console.log("Order placed successfully with ID:", orderId);

        res.status(200).json({ success: true, orderId });
    } catch (error) {
        console.error("Error placing COD order:", error);
        res.status(500).json({ success: false, message: "Failed to place COD order" });
    }
};

export {
    placeOrder,
    placeOrderRazorpay,
    listOrders,
    userOrders,
    updateStatus,
    verifyOrder,
    placeOrderCod
};
