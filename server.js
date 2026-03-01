import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GOFILE_TOKEN = process.env.GOFILE_API_TOKEN;

/* ===== TEST ROUTE ===== */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "GoFile Fast Upload Server Running 🚀"
  });
});

/* ===== UPLOAD ROUTE ===== */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1️⃣ Get best GoFile server
    const serverRes = await fetch("https://api.gofile.io/servers");
    const serverData = await serverRes.json();
    const server = serverData.data.servers[0].name;

    // 2️⃣ Upload to GoFile
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);
    form.append("token", GOFILE_TOKEN);

    const uploadRes = await fetch(
      `https://${server}.gofile.io/uploadFile`,
      { method: "POST", body: form }
    );

    const uploadData = await uploadRes.json();

    if (uploadData.status !== "ok") {
      return res.status(500).json({ error: "GoFile upload failed" });
    }

    res.json({
      success: true,
      downloadPage: uploadData.data.downloadPage,
      directLink: uploadData.data.directLink
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
