import express from "express";
import multer from "multer";
import path from "path";
import { Storage } from "@google-cloud/storage";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const storage = new Storage();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join("public")));
app.set("view engine", "ejs");

// Index Page
app.get("/", (req, res) => {
  return res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).send("Only PDF files are allowed");
    }

    const uniqueName = `${Date.now()}-${file.originalname}`;
    const blob = storage.bucket(process.env.BUCKET_NAME).file(uniqueName);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).send("Upload failed");
    });

    blobStream.on("finish", async () => {
      // Optional: make public or store the URL
      const publicUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${blob.name}`;
      res.status(200).send({ message: "Upload Success", url: publicUrl });
    });

    blobStream.end(file.buffer);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Unexpected error occurred");
  }
});

// Results Page
app.get("/results", (req, res) => {
  return res.render("result");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The App is working on http://localhost:${port}`);
});
