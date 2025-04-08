const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  address: {
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String,
  },
  shopName: { type: String, required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  amount: { type: Number, required: true },
  orderId: { type: String, required: true }, // ✅ custom order ID (NVYYYYMMDD###)
  razorpayOrderId: { type: String },         // ✅ store Razorpay ID separately
  paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
  payment: { type: Boolean, default: false },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});
