import { Request, Response } from "express";
import Link, { ILink } from "../models/Link.js";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

// ============================
// ✅ Create a new download link
// ============================
export const createLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalUrl, format } = req.body;
    const userId = req.user?.id; // Use authenticated user ID

    if (!originalUrl) {
      res.status(400).json({ message: "originalUrl is required" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Create link document with pending status
    const link: ILink = await Link.create({
      originalUrl,
      status: "pending",
      format: format || "mp4",
      owner: userId,
    });

    // Generate filename
    const filename = `${link._id}.${format || "mp4"}`;
    const outputPath = path.join("downloads", filename);

    // Make sure downloads folder exists
    if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

    // Start download using yt-dlp
    exec(`yt-dlp -f best -o "${outputPath}" ${originalUrl}`, async (error) => {
      if (error) {
        console.error("Download failed:", error);
        link.status = "failed";
        await link.save();
        return;
      }

      link.downloadUrl = `/downloads/${filename}`; // frontend can fetch from this path
      link.status = "ready";
      await link.save();
    });

    res.status(201).json({ message: "Link created", linkId: link._id, status: link.status });
  } catch (error: any) {
    console.error("Create Link Error:", error.message);
    res.status(500).json({ message: "Failed to create link", error: error.message });
  }
};

// ============================
// ✅ Get all links for the authenticated user
// ============================
export const getLinks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const links = await Link.find({ owner: userId }).sort({ createdAt: -1 });
    res.status(200).json(links);
  } catch (error: any) {
    console.error("Get Links Error:", error.message);
    res.status(500).json({ message: "Failed to fetch links", error: error.message });
  }
};

// ============================
// ✅ Get a single link by ID
// ============================
export const getLinkById = async (req: Request, res: Response): Promise<void> => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }

    // Optional: Only allow owner to view
    if (link.owner.toString() !== req.user?.id) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    res.status(200).json(link);
  } catch (error: any) {
    console.error("Get Link Error:", error.message);
    res.status(500).json({ message: "Failed to fetch link", error: error.message });
  }
};
