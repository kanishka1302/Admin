import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true, // Optional: only if each cart is bound to one shop
  },
    },
  ],
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;

