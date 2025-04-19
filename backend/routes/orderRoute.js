import express from 'express';
import authMiddleware from '../middleware/auth.js';
import orderModel from '../models/orderModel.js';
import {
  listOrders,
  placeOrder,
  updateOrderStatus,
  userOrders,
  placeOrderCod,
  placeOrderRazorpay,
  verifyOrder,
  generateAdminOrder,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Admin: Get all orders
orderRouter.get('/list', authMiddleware, listOrders);

// User: Get their own orders
orderRouter.post('/userorders', authMiddleware, userOrders);

// General order placement (auto-detect method)
orderRouter.post('/place', authMiddleware, placeOrder);

// Direct endpoint: COD order
orderRouter.post('/cod', authMiddleware, placeOrderCod);

// Direct endpoint: Razorpay order
orderRouter.post('/razorpay', authMiddleware, placeOrderRazorpay);

// Razorpay: Verify payment
orderRouter.post('/verify', authMiddleware, verifyOrder); // ✅ NEW

// Admin/User: Update order status
orderRouter.post('/status', authMiddleware, updateOrderStatus);

orderRouter.post('/admin/newOrder', generateAdminOrder);

// Route for fetching the count of orders
orderRouter.get("/count", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
        return res.status(400).json({ success: false, message: "Invalid or missing date parameter." });
      }
  
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
  
      const count = await orderModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
  
      res.json({ success: true, count });
    } catch (error) {
        console.error("Error fetching order count:", error);
        res.status(500).json({ success: false, message: "Failed to fetch order count." });
      }
    });
    

export default orderRouter;
