import mongoose from "mongoose";

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
    items: [
        {
            //_id: String,
            name: String,
            //description: String,
            price: Number,
            //image: String,
            //category: String,
            quantity: Number,
        },
    ],

    amount: { type: Number, required: true }, // Stored in paise
    orderId: { type: String, required: true }, // For both Razorpay and COD orders
    //payment: { type: Boolean, default: false }, // True if paid (e.g., Razorpay), false for COD
    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true }, // Payment method
    //discountApplied: { type: Boolean, default: false }, // Discount status
    //promoCode: { type: String, default: "" }, // Applied promo code, if any
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
});

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;
