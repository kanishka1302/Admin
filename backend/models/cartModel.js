import mongoose from 'mongoose';

// cartModel.js
const cartSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true, // Make sure the mobileNumber is required
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
    },
  ],
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
