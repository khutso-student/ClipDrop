import express from "express";
import { createLink, getLinks, getLinkById } from "../controller/linkController.js";
import { protect } from "../middleware/auth.js" 

const router = express.Router();

// ✅ All routes require authentication
router.post("/", protect, createLink);
router.get("/", protect, getLinks);
router.get("/:id", protect, getLinkById);

export default router;
