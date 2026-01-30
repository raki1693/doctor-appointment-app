import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { httpError } from "../utils/httpError.js";
import { SymptomCheck } from "../models/SymptomCheck.js";
import { runSymptomCheckText, runSymptomCheckImage } from "../services/symptomAi.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

function assertOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw httpError(500, "OPENAI_API_KEY missing in backend .env  +\\change this");
  }
}

// POST /api/ai/symptom-check
router.post("/symptom-check", requireAuth, async (req, res, next) => {
  try {
    assertOpenAI();
    const { mode = "text", text = "", languagePref = "en", save = true } = req.body || {};
    if (!text || String(text).trim().length < 3) {
      return next(httpError(400, "Please enter symptoms (at least 3 characters)"));
    }

    const result = await runSymptomCheckText({ text: String(text).trim() });

    let doc = null;
    if (save !== false) {
      doc = await SymptomCheck.create({
        userId: req.user._id,
        mode: mode === "voice" ? "voice" : "text",
        inputText: String(text).trim(),
        result,
        languagePref,
      });
    }

    return res.json({ id: doc?._id, result });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/symptom-check-image (multipart: image)
router.post(
  "/symptom-check-image",
  requireAuth,
  upload.single("image"),
  async (req, res, next) => {
    try {
      assertOpenAI();
      const text = String(req.body?.text || "");
      const languagePref = String(req.body?.languagePref || "en");
      const save = req.body?.save !== "false" && req.body?.save !== false;

      if (!req.file) return next(httpError(400, "Image is required"));

      const mime = req.file.mimetype || "image/jpeg";
      const imageBase64 = req.file.buffer.toString("base64");

      const result = await runSymptomCheckImage({
        text,
        imageMime: mime,
        imageBase64,
      });

      let doc = null;
      if (save) {
        doc = await SymptomCheck.create({
          userId: req.user._id,
          mode: "camera",
          inputText: text,
          imageMime: mime,
          imageBase64: imageBase64.slice(0, 250000), // cap storage ~250kb
          result,
          languagePref,
        });
      }

      return res.json({ id: doc?._id, result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/ai/history
router.get("/history", requireAuth, async (req, res, next) => {
  try {
    const items = await SymptomCheck.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
