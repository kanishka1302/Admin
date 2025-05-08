import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart, deleteCartAfterOrder } from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/order/placed', async (req, res) => {
  const { mobileOrEmail } = req.body;

  if (!mobileOrEmail) {
    return res.status(400).json({ success: false, message: "mobileOrEmail required" });
  }

  try {
    const result = await deleteCartAfterOrder(mobileOrEmail);

    if (result.success) {
      res.status(200).json({ success: true, message: result.message });
    } else {
      res.status(404).json({ success: false, message: result.message });
    }
  } catch (err) {
    console.error('Error deleting cart after order:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

cartRouter.post("/get", getCart);
cartRouter.post("/add", addToCart);
cartRouter.post("/remove", removeFromCart);
cartRouter.post("/clear", clearCart);

export default cartRouter;
