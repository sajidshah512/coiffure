
// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { runStreamlitPipeline } = require("./puppeteer_worker");

const userRoutes = require("./routes/users");
const stylistRoutes = require("./routes/stylists");
const serviceRoutes = require("./routes/services");
const bookingRoutes = require("./routes/bookings");
const ratingRoutes = require("./routes/ratings");
const authRoutes = require("./routes/otpauth");

const auth = require("./middleware/auth");
const adminAuth = require("./middleware/adminAuth");

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);

// Directories
const uploadsDir = path.join(__dirname, "uploads");
const resultsDir = path.join(__dirname, "results");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));
app.use("/results", express.static(resultsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${Math.random()}${path.extname(
        file.originalname
      )}`
    ),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only images allowed"), false),
});

// ---------------- AI Endpoint ----------------
app.post(
  "/api/ai/hairtryon",
  upload.fields([
    { name: "target" },
    { name: "source" },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.target || !req.files?.source) {
        return res.status(400).json({
          error: "Upload both target and source images.",
        });
      }

      const targetPath = req.files.target[0].path;
      const sourcePath = req.files.source[0].path;

      if (!process.env.STREAMLIT_URL) {
        return res.status(500).json({ error: "STREAMLIT_URL missing in .env" });
      }

      const result = await runStreamlitPipeline({
        ngrokUrl: process.env.STREAMLIT_URL,
        targetPath,
        sourcePath,
        outputDir: resultsDir,
        headless: process.env.PUPPETEER_HEADLESS !== "false",
        noSandbox: process.env.PUPPETEER_NO_SANDBOX === "true",
        timeout: Number(process.env.PUPPETEER_TIMEOUT) || 90000,
      });

      res.json({
        success: true,
        outputUrl: result.outputUrl,
        outputPath: result.outputPath,
      });
    } catch (err) {
      console.error("❌ AI ERROR:", err);
      res.status(500).json({ error: "AI processing failed", detail: err.message });
    }
  }
);

// Other APIs
app.use("/api/users", userRoutes);
app.use("/api/otpauth", authRoutes);
app.use("/api/stylists", auth, stylistRoutes);
app.use("/api/services", auth, serviceRoutes);
app.use("/api/bookings", auth, bookingRoutes);
app.use("/api/ratings", auth, ratingRoutes);
app.use('/api/hairstyle', require('./routes/hairstyle'));

app.get("/", (req, res) => res.send("Coiffure Backend Working"));

// Server + Database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 8080, "0.0.0.0", () =>
      console.log("🚀 Backend running on PORT", process.env.PORT || 8080)
    );
  })
  .catch((err) => console.error("❌ DB Connection Failed:", err));
