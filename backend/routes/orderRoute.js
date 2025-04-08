import express from 'express';
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  placeOrderCod,
  placeOrderRazorpay,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get("/list", listOrders);
orderRouter.post("/userorders", userOrders);
orderRouter.post("/place", placeOrder);            // Uses smart detection (cod or razorpay)
orderRouter.post("/cod", placeOrderCod);           // Optional: Direct endpoint
orderRouter.post("/razorpay", placeOrderRazorpay); // Optional: Direct endpoint
orderRouter.post("/status", updateStatus);

export default orderRouter;
