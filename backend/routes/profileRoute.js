import express from "express";
import { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile, checkProfile, getUserOrders } from "../controllers/profileController.js";

const profileRouter = express.Router();

profileRouter.get("/", getAllProfiles);
profileRouter.get("/:id", getProfileById);
profileRouter.post("/", createProfile);
profileRouter.put("/:id", updateProfile);
profileRouter.delete("/:id", deleteProfile);
profileRouter.post("/check", checkProfile);
profileRouter.get("/:id/orders", getUserOrders); // ✅ New route to fetch user orders

export default profileRouter;
