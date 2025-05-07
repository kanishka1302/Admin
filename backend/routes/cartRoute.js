import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart, deleteCartAfterOrder } from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/order/placed', async (req, res) => {
  const { mobileOrEmail } = req.body;
  if (!mobileOrEmail) return res.status(400).json({ success: false, message: "mobileOrEmail required" });

  try {
    await deleteCartAfterOrder(mobileOrEmail);
    res.status(200).json({ success: true, message: 'Order placed and cart deleted' });
  } catch (error) {
    console.error("Error deleting cart after order:", error.message);
    res.status(500).json({ success: false, message: 'Failed to delete cart after order' });
  }
});



cartRouter.post("/get", getCart);
cartRouter.post("/add", addToCart);
cartRouter.post("/remove", removeFromCart);
cartRouter.post("/clear", clearCart);

export default cartRouter;
