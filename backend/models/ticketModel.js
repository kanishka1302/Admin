import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  issue: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in progress", "closed"],
    default: "open",
  },
  userMessage: {
    type: String,
    default: "",
  },
  userName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ticketSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
