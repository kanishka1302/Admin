import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart, deleteCartAfterOrder } from '../controllers/cartController.js';

const cartRouter = express.Router();

// Order placed route
cartRouter.post('/order/placed', async (req, res) => {
  const { mobileNumber } = req.body;

  // Make sure to place the order logic here (e.g., Razorpay or COD)

  // After placing the order, delete the cart
  await deleteCartAfterOrder(mobileNumber);

  res.status(200).json({ success: true, message: 'Order placed and cart deleted' });
});

// Get Cart (using mobileNumber or email passed in the request body)
cartRouter.post("/get", async (req, res) => {
  const { mobileNumber } = req.body;  // Extract mobileNumber or another unique identifier
  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }
  req.body.mobileNumber = mobileNumber;  // Pass mobileNumber in the request body to the controller
  return getCart(req, res);  // Call the getCart controller with the modified request
});

// Add Item to Cart
cartRouter.post("/add", async (req, res) => {
  const { mobileNumber, productId, quantity } = req.body;
  if (!mobileNumber || !productId || !quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  return addToCart(req, res);  // Call the addToCart controller with the provided request
});

// Remove Item from Cart
cartRouter.post("/remove", async (req, res) => {
  const { mobileNumber, productId } = req.body;
  if (!mobileNumber || !productId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  return removeFromCart(req, res);  // Call the removeFromCart controller with the provided request
});

cartRouter.post('/clear', clearCart);

cartRouter.get('/user/:mobileNumber', async (req, res) => {
  const { mobileNumber } = req.params;
  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }
  req.body.mobileNumber = mobileNumber;
  return getCart(req, res);
});


export default cartRouter;
