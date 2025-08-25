//routes/notes.js

import express from "express";
import Note from "../models/Note.js";
import mongoose from "mongoose";

import upload from "../middleware/multer.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

import {
  adminAuth,
  extractImageUrls,
  deleteFilesFromCloudinary,
  diffImageUrls,
  parseArray,
} from "../utils/notes.js";

const router = express.Router();

// Get all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create note
router.post(
  "/",
  adminAuth,
  upload.fields([{ name: "pdfs", maxCount: 5 }]),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title || typeof title !== "string") {
        return res
          .status(400)
          .json({ error: "Title is required and must be a string" });
      }
      if (!content || typeof content !== "string") {
        return res
          .status(400)
          .json({ error: "Content is required and must be a string" });
      }

      const contentImages = extractImageUrls(content);

      let pdfLinks = [];

      if (req.files["pdfs"]) {
        const uploads = await Promise.all(
          req.files["pdfs"].map((file) =>
            uploadToCloudinary(file.path, "notes/pdfs")
          )
        );

        // Get PDF titles from request
        const pdfTitles = Array.isArray(req.body.pdfTitles)
          ? req.body.pdfTitles
          : typeof req.body.pdfTitles === "string"
          ? [req.body.pdfTitles]
          : [];

        pdfLinks = uploads.map((u, index) => ({
          url: u.secure_url,
          title:
            pdfTitles[index] ||
            req.files["pdfs"][index].originalname.replace(/\.pdf$/i, ""),
        }));
      }

      const note = new Note({
        title: title.trim(),
        content: content.trim(),
        pdfs: pdfLinks,
      });
      await note.save();
      res.json(note);
    } catch (error) {
      console.error("Create Note Error:", error);

      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ error: "Invalid note data: " + error.message });
      }

      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//  Get Note By ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Note ID" });
  }
  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found!" });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Note By ID
router.put(
  "/:id",
  adminAuth,
  upload.fields([
    {
      name: "pdfs",
      maxCount: 5,
    },
  ]),
  async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Note ID" });
    }

    try {
      const { title, content } = req.body;

      const updateData = {};
      const existingNote = await Note.findById(id);
      if (!existingNote)
        return res.status(404).json({ error: "Note not found!" });

      if (title !== undefined) {
        if (typeof title !== "string")
          return res.status(400).json({ error: "Invalid title" });
        updateData.title = title;
      }

      // CONTENT
      if (content !== undefined) {
        if (typeof content !== "string")
          return res.status(400).json({ error: "Invalid content" });

        const removeImages = diffImageUrls(existingNote.content, content);
        await deleteFilesFromCloudinary(removeImages);
        updateData.content = content;
      }

      // PDF
      let newPdfLinks = [];

      if (req.files["pdfs"]) {
        const uploads = await Promise.all(
          req.files["pdfs"].map((file) =>
            uploadToCloudinary(file.path, "notes/pdfs")
          )
        );

        // Get PDF titles from request
        const pdfTitles = Array.isArray(req.body.pdfTitles)
          ? req.body.pdfTitles
          : typeof req.body.pdfTitles === "string"
          ? [req.body.pdfTitles]
          : [];

        newPdfLinks = uploads.map((u, index) => ({
          url: u.secure_url,
          title:
            pdfTitles[index] ||
            req.files["pdfs"][index].originalname.replace(/\.pdf$/i, ""),
        }));
      }

      let pdfLinks = [];
      if (req.body.pdfs) {
        pdfLinks = parseArray(req.body.pdfs).map((pdf) =>
          typeof pdf === "string" ? { url: pdf, title: "" } : pdf
        );
      }

      updateData.pdfs = [
        ...(existingNote.pdfs || []),
        ...newPdfLinks,
        ...(Array.isArray(pdfLinks) ? pdfLinks : []),
      ];

      const removePdfs = parseArray(req.body.removePdfs);

      if (Array.isArray(removePdfs)) {
        // Delete from Cloudinary
        await deleteFilesFromCloudinary(removePdfs);
        // Filter out removed PDFs by matching URLs
        updateData.pdfs = updateData.pdfs.filter(
          (pdf) => !removePdfs.includes(pdf.url)
        );
      }

      // Remove duplicates based on URL
      updateData.pdfs = updateData.pdfs.filter(
        (pdf, index, self) => index === self.findIndex((p) => p.url === pdf.url)
      );

      const updatedNote = await Note.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updatedNote)
        return res.status(404).json({ error: "Note not found!" });
      res.json(updatedNote);
    } catch (error) {
      console.error("Update Note Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Delete a document
router.delete("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Note ID" });
  }
  try {
    const existingNote = await Note.findByIdAndDelete(id);
    if (!existingNote)
      return res.status(404).json({ error: "Note not found!" });

    if (Array.isArray(existingNote.pdfs)) {
      await deleteFilesFromCloudinary(existingNote.pdfs);
    }
    // Delete images from content
    const contentImages = extractImageUrls(existingNote.content || "");
    await deleteFilesFromCloudinary(contentImages);

    res.json({ message: "Note deleted successfully", existingNote });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
