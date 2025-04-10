import express from "express";
import { createTicket, getAllTickets } from "../controllers/ticketController.js";

const router = express.Router();

// Correct endpoint for ticket creation
router.post("/create", createTicket);

// Fetch all tickets
router.get("/all", getAllTickets);

export default router;
