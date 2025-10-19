import mongoose, { Schema, Document } from "mongoose";

// Define the structure (interface) of a User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin";
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
}

// Define the schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },

    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create and export the model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
