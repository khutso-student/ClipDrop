import { Request, Response } from "express";
import Link, { ILink } from "../models/Link.js";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

// Helper: validate URL
const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);

// ============================
// Create a new download link
// ============================
export const createLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalUrl, format } = req.body;
    const userId = req.user?.id;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      res.status(400).json({ message: "A valid originalUrl is required" });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Create link in DB with pending status
    const link: ILink = await Link.create({
      originalUrl,
      status: "pending",
      format: format || "mp4",
      owner: userId,
      title: "",
      thumbnail: "",
      qualities: [],
    });

    // Ensure downloads folder exists
    if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

    const filename = `${link._id}.${format || "mp4"}`;
    const outputPath = path.join("downloads", filename);

    // Fetch metadata safely
    execFile("yt-dlp", ["-j", originalUrl], async (metaErr, stdout) => {
      if (metaErr) {
        console.error("Metadata fetch failed:", metaErr);
        await Link.findByIdAndUpdate(link._id, { status: "failed" });
        return;
      }

      try {
        const metadata = JSON.parse(stdout);
        const title = metadata.title || "Unknown Title";
        const thumbnail = metadata.thumbnail || "";
        const qualities =
          metadata.formats
            ?.filter((f: any) => f.vcodec !== "none")
            .map((f: any) => f.format_note || f.format_id)
            .slice(-3) || ["best"];

        await Link.findByIdAndUpdate(link._id, { title, thumbnail, qualities });
      } catch (parseErr) {
        console.error("Metadata parse error:", parseErr);
      }
    });

    // Download in background
    execFile(
      "yt-dlp",
      ["-f", "best", "-o", outputPath, originalUrl],
      async (downloadErr) => {
        if (downloadErr) {
          console.error("Download failed:", downloadErr);
          await Link.findByIdAndUpdate(link._id, { status: "failed" });
          return;
        }

        const downloadUrl = `/downloads/${filename}`;
        await Link.findByIdAndUpdate(link._id, { downloadUrl, status: "ready" });
      }
    );

    // Return response immediately
    res.status(201).json({
      message: "Link created",
      linkId: link._id,
      status: link.status,
    });
  } catch (error: any) {
    console.error("Create Link Error:", error.message);
    res.status(500).json({ message: "Failed to create link", error: error.message });
  }
};

// ============================
// Get all links for the authenticated user
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
// Get a single link by ID
// ============================
export const getLinkById = async (req: Request, res: Response): Promise<void> => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }

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
