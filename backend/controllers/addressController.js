import Order from '../models/orderModel.js';

// Place COD or prepaid order
export const placeOrder = async (req, res) => {
  try {
    const {
      ownerMobile,          // Logged-in user
      items,                // Cart items
      totalAmount,
      paymentMethod,        // "COD" or "Razorpay"
      address,              // Selected address object
    } = req.body;

    const newOrder = new Order({
      ownerMobile,
      items,
      totalAmount,
      paymentMethod,
      address,
      status: 'pending',
      createdAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).json({ success: false, error: 'Failed to place order' });
  }
};
