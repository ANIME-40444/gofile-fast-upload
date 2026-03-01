import express from "express";
import multer from "multer";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("GoFile Fast Backend Running ✅");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Get best server
    const serverRes = await axios.get("https://api.gofile.io/getServer");
    const server = serverRes.data.data.server;

    // Upload file
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const uploadRes = await axios.post(
      `https://${server}.gofile.io/uploadFile`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.GOFILE_API_TOKEN}`
        }
      }
    );

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      downloadLink: uploadRes.data.data.downloadPage
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Upload failed"
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
