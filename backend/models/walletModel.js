import mongoose from 'mongoose';

// Define the schema for the Wallet model
const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Assuming you have a User model
  balance: { type: Number, required: true, default: 0 },
  transactions: [
    {
      type: { type: String, required: true }, // 'credit' or 'debit'
      amount: { type: Number, required: true },
      paymentId: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// Create the Wallet model
const WalletModel = mongoose.model('Wallet', walletSchema);

export default WalletModel;
