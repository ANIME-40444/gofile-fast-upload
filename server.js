import express from "express";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024
  }
});

/* ================= UPLOAD API ================= */

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res
          .status(400)
          .json({
            error: "No file uploaded"
          });
      }

      const form = new FormData();

      form.append(
        "reqtype",
        "fileupload"
      );

      form.append(
        "userhash",
        "518616d5341cbf24b2236fe02"
      );

      form.append(
        "fileToUpload",
        req.file.buffer,
        req.file.originalname
      );

      const response = await fetch(
        "https://catbox.moe/user/api.php",
        {
          method: "POST",
          body: form,
          headers: form.getHeaders()
        }
      );

      const text =
        await response.text();

      if (
        !text.startsWith("https://")
      ) {

        return res
          .status(500)
          .json({
            error: text
          });

      }

      res.json({
        success: true,
        url: text.trim()
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.toString()
      });

    }

  }
);

/* ================= START ================= */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "Server Running On Port " +
    PORT
  );

});
