const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { validateMimeAndSize } = require('../services/utils');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024 } });
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

/**
 * POST /api/uploads
 * Accepts multipart form-data with field name "files" (one or many).
 * Saves under LOCAL_UPLOAD_DIR/temp and returns public URLs.
 */
router.post('/', limiter, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'error.no_file' });
    }
    const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
    const dir = path.join(process.cwd(), uploadDir, 'temp');
    await fs.mkdir(dir, { recursive: true });
    const urls = [];
    for (const file of req.files) {
      validateMimeAndSize(file);
      const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
      const filename = `${crypto.randomUUID()}.${ext}`;
      const filepath = path.join(dir, filename);
      if (!file.buffer || file.buffer.length === 0) continue;
      await fs.writeFile(filepath, file.buffer);
      urls.push(`${process.env.PUBLIC_UPLOAD_BASE || '/uploads'}/temp/${filename}`);
    }
    res.status(201).json({ urls });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
