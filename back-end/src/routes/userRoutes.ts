// routes/userRoutes.ts
import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getUserById,
  getCurrentUser,
} from "../controller/userController.js";

import { protect } from "../middleware/auth.js"; // import protect middleware

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes (require token)
router.get("/me", protect, getCurrentUser);
router.get("/:id", protect, getUserById);

export default router;
