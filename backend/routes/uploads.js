// backend/routes/uploads.js
import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { HttpError } from "../middleware/httpError.js"
import authenticateFlexible from "../middleware/authenticateFlexible.js"
import { requireRole } from "../middleware/requireRole.js"
import { prisma } from "../db/prisma.js"

const router = express.Router()

// ───────────────────────────────────────────────
// Répertoire d’upload
// ───────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads")
try {
  fs.mkdirSync(uploadDir, { recursive: true })
} catch (error) {
  console.error("Erreur création uploadDir:", error)
}

// ───────────────────────────────────────────────
// Configuration Multer
// ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase()
    const base =
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
    cb(null, `${base}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (!allowed.includes(file.mimetype)) {
    return cb(new HttpError(400, "INVALID_FILE", "Format de fichier invalide"))
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
})

// ───────────────────────────────────────────────
// POST /api/uploads
// Roles: CLIENT, PROVIDER, ADMIN
// ───────────────────────────────────────────────
router.post(
  "/",
  authenticateFlexible,
  requireRole(["CLIENT", "PROVIDER", "ADMIN"]),
  upload.array("file", 5), // max 5 fichiers
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        throw new HttpError(400, "NO_FILE", "Aucun fichier fourni")
      }

      const uploads = []
      for (const file of req.files) {
        const dbUpload = await prisma.upload.create({
          data: {
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: `/api/uploads/${file.filename}`, // URL publique
            userId: req.user?.id ?? null, // lien avec l’utilisateur si connecté
          },
        })
        uploads.push(dbUpload.url)
      }

      return res.status(201).json({
        code: "UPLOAD_SUCCESS",
        message: "Fichiers uploadés avec succès",
        urls: uploads,
        requestId: req.id,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ───────────────────────────────────────────────
// GET /api/uploads/:file
// ───────────────────────────────────────────────
router.get("/:file", async (req, res, next) => {
  try {
    const filePath = path.join(uploadDir, req.params.file)
    if (!fs.existsSync(filePath)) {
      throw new HttpError(404, "NOT_FOUND", "Fichier introuvable")
    }
    res.sendFile(filePath)
  } catch (err) {
    next(err)
  }
})

export default router
