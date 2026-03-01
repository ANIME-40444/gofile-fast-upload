import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GOFILE_API_TOKEN = process.env.GOFILE_API_TOKEN;

/* ---------- Middlewares ---------- */
app.use(cors());
app.use(express.json());

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
  }
});

/* ---------- Health Check ---------- */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "GoFile Fast Upload Server Running 🚀"
  });
});

/* ---------- Upload Route ---------- */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    /* 1️⃣ Get best GoFile server */
    const serverRes = await fetch("https://api.gofile.io/servers");
    const serverData = await serverRes.json();

    if (serverData.status !== "ok") {
      throw new Error("Failed to get GoFile server");
    }

    const server = serverData.data.servers[0].name;

    /* 2️⃣ Upload file to GoFile */
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const uploadRes = await fetch(
      `https://${server}.gofile.io/uploadFile`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GOFILE_API_TOKEN}`
        },
        body: form
      }
    );

    const uploadData = await uploadRes.json();

    if (uploadData.status !== "ok") {
      throw new Error("GoFile upload failed");
    }

    const downloadLink = uploadData.data.downloadPage;

    /* 3️⃣ Send response */
    res.json({
      success: true,
      fileName: req.file.originalname,
      size: req.file.size,
      downloadLink
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
