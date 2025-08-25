import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import notesRouter from "./routes/notes.js";
import imagesRouter from "./routes/images.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/notes", notesRouter);
app.use("/api/images", imagesRouter);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
