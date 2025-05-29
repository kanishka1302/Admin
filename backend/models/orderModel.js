import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
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

    items: [
      {
        _id: String, // Optional: Keep if referencing original food item
        name: String,
        description: String,
        price: Number,
        image: String,
        category: String,
        quantity: Number,
        shopName: String,
      },
    ],

    shopName: { type: String, default: "" }, // Also present inside items

    amount: { type: Number, required: true },

    orderId: { type: String, required: true,  unique: true, }, // Format: NVYYYYMMDD###

    razorpayOrderId: { type: String }, // Only for online payments

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },

    payment: { type: Boolean, default: false },

    discountApplied: { type: Boolean, default: false },
    promoCode: { type: String, default: "" },

    status: { type: String, default: "Order Placed" }, // You can expand this: "Pending", "Confirmed", "Delivered", "Cancelled", etc.
    statusTimestamps: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);


// Prevent model overwrite in development
const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default OrderModel;
