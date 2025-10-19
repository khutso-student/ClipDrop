import mongoose, { Document, Schema } from "mongoose";
import User from "./User.js";

// Define interface for TypeScript
export interface ILink extends Document {
  originalUrl: string;
  downloadUrl?: string;
  title?: string;
  format?: string;
  status: "pending" | "ready" | "failed";
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    originalUrl: { type: String, required: true },
    downloadUrl: { type: String },
    title: { type: String },
    format: { type: String },
    status: { type: String, enum: ["pending", "ready", "failed"], default: "pending" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILink>("Link", linkSchema);
