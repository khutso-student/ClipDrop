import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// ✅ Create the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // can be changed to Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @desc Register a new user
 * @route POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error("Signup Error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error("Login Error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

/**
 * @desc Forgot Password (Send reset link)
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({
        message: "If an account with that email exists, a reset link has been sent",
      });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // Date object 15 minutes from now

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();


    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      from: `"ClipDrop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error: any) {
    console.error("Forgot Password Error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to send reset link", error: error.message });
  }
};

/**
 * @desc Reset Password
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Reset link is invalid or has expired" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Reset failed", error: error.message });
  }
};

/**
 * @desc Get User by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Get User Error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};
