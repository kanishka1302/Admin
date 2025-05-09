// models/HistoryModel.js
import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
  },
  employeeEmail: {
    type: String,
    required: true,
  },
  creditedAmount: {
    type: Number,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userMobile: {
    type: String,
    required: true,
  },
  creditedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true // this adds createdAt and updatedAt automatically
});

const History = mongoose.models.History || mongoose.model("History", historySchema);
export default History;


