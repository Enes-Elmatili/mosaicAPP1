// backend/routes/uploads.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { HttpError } from "../middleware/httpError.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";

const router = express.Router();

// ───────────────────────────────────────────────
// Répertoire d’upload
// ───────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads");
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (error) {
  console.error("Erreur création uploadDir:", error);
}

// ───────────────────────────────────────────────
// Configuration Multer
// ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    cb(null, `${base}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /image\/(jpeg|jpg|png|webp|gif)/i.test(file.mimetype || "");
  if (!ok) {
    cb(new HttpError(400, "Type de fichier interdit (images uniquement)"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5Mo max, 8 fichiers
});

// ───────────────────────────────────────────────
// POST /api/uploads → upload & persist DB
// ───────────────────────────────────────────────
router.post("/", authenticateFlexible, upload.array("files", 8), async (req, res, next) => {
  try {
    const files = req.files || [];
    const base = `${req.protocol}://${req.get("host")}/api/uploads`;

    const savedFiles = await Promise.all(
      files.map((f) =>
        prisma.file.create({
          data: {
            filename: f.filename,
            original: f.originalname,
            size: f.size,
            mimetype: f.mimetype,
            url: `${base}/${f.filename}`,
            userId: req.user.id,
          },
        })
      )
    );

    res.status(201).json({ success: true, files: savedFiles });
  } catch (error) {
    next(error);
  }
});

// ───────────────────────────────────────────────
// GET /api/uploads/mine → mes fichiers
// ───────────────────────────────────────────────
router.get("/mine", authenticateFlexible, requireRole("CLIENT", "PROVIDER"), async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
});

// ───────────────────────────────────────────────
// GET /api/uploads → tous les fichiers (ADMIN)
// ───────────────────────────────────────────────
router.get("/", authenticateFlexible, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
});

// ───────────────────────────────────────────────
// GET /api/uploads/:file → récupérer un fichier
// ───────────────────────────────────────────────
router.get("/:file", authenticateFlexible, async (req, res, next) => {
  try {
    const fileRecord = await prisma.file.findUnique({
      where: { filename: req.params.file },
    });

    if (!fileRecord) return res.status(404).json({ error: "File not found" });

    if (req.user.role !== "ADMIN" && fileRecord.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const filePath = path.join(uploadDir, fileRecord.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(410).json({ error: "File no longer exists" });
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

// ───────────────────────────────────────────────
// DELETE /api/uploads/:file → suppression
// ───────────────────────────────────────────────
router.delete("/:file", authenticateFlexible, async (req, res, next) => {
  try {
    const fileRecord = await prisma.file.findUnique({
      where: { filename: req.params.file },
    });

    if (!fileRecord) return res.status(404).json({ error: "File not found" });

    if (req.user.role !== "ADMIN" && fileRecord.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const filePath = path.join(uploadDir, fileRecord.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.file.delete({ where: { id: fileRecord.id } });

    res.json({ success: true, message: "File deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
