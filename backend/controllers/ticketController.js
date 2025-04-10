import Ticket from "../models/ticketModel.js";
import Profile from "../models/profileModel.js";

// Helper to generate ticket ID in YYYYMMDD-NV### format
const generateTicketId = async () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const regex = new RegExp(`^${datePart}-NV(\\d{3})$`);

  const latestTicket = await Ticket.findOne({ ticketId: { $regex: regex } }).sort({ createdAt: -1 });

  let newCount = 1;
  if (latestTicket) {
    const match = latestTicket.ticketId.match(/NV(\d{3})$/);
    if (match) newCount = parseInt(match[1], 10) + 1;
  }

  const padded = String(newCount).padStart(3, "0");
  return `${datePart}-NV${padded}`;
};

// Create a new support ticket
export const createTicket = async (req, res) => {
  try {
    const { issue, mobileNumber } = req.body;

    // Validate request data
    if (!issue || !mobileNumber) {
      return res.status(400).json({ error: "Issue and mobile number are required" });
    }

    // Fetch user profile by mobile number
    const userProfile = await Profile.findOne({ mobileNumber });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Generate a unique ticket ID
    const ticketId = await generateTicketId();

    // Create and save ticket
    const newTicket = new Ticket({
      ticketId,
      userName: userProfile.name,
      mobileNumber: userProfile.mobileNumber,
      issue,
    });

    await newTicket.save();

    res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all tickets (with optional filters)
export const getAllTickets = async (req, res) => {
  try {
    const { status, mobileNumber } = req.query; // Optional filters

    const filter = {};
    if (status) filter.status = status;
    if (mobileNumber) filter.mobileNumber = mobileNumber;

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 }); // Sort by latest tickets

    res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
