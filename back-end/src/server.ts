import dotenvFlow from "dotenv-flow";
dotenvFlow.config({ node_env: process.env.NODE_ENV || "development" });

import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js"; 
import userRoutes from "./routes/userRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";

// Connect to MongoDB
await connectDB();

const app = express();

// --------------------
// CORS setup
// --------------------
const allowedOrigins = [
  process.env.CLIENT_URL,          // frontend URL
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true); // allow requests like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `❌ CORS blocked: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

// --------------------
// Middleware
// --------------------
app.use(cors(corsOptions));
app.use(express.json());

// --------------------
// Routes
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/links", linkRoutes);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV,
    mongo: !!process.env.MONGO_URI,
    clientUrl: process.env.CLIENT_URL || null,
  });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
