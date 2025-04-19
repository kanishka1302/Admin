import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema({
  date: {
    type: String, // 'YYYYMMDD'
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("OrderCounter", orderCounterSchema);
