import express from "express";
import { createOrder, verifyPayment, getWalletDetails } from "../controllers/WalletController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/details", getWalletDetails);


export default router;
