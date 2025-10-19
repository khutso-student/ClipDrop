import express from "express";
import 
{ signup, login, forgotPassword, resetPassword, getUserById  } 
from "../controller/userController.js"; 

const router = express.Router();

// Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/:id", getUserById);

export default router;
