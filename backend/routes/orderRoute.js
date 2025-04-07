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
orderRouter.post("/place", placeOrder);
orderRouter.post("/cod", placeOrderCod);
orderRouter.post("/razorpay", placeOrderRazorpay);
orderRouter.post("/status", updateStatus);

export default orderRouter;
