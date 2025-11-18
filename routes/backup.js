const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");
const { backupDatabase } = require("../controllers/backupController");

require("dotenv").config();

// Folder backup utamanya
const BACKUP_DIR = path.join(process.cwd(), "backup");

// Jika folder belum ada → buat
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// -----------------------------------------
// ✅ 1) BACKUP MANUAL
// -----------------------------------------
router.get("/manual", backupDatabase);

// -----------------------------------------
// 📤 2) RESTORE MANUAL — Upload file SQL
// -----------------------------------------
const upload = multer({
  dest: BACKUP_DIR,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".sql")) cb(null, true);
    else cb(new Error("Hanya file .sql yang diperbolehkan"), false);
  }
});

router.post("/restore", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File SQL tidak ditemukan!" });
  }

  const filePath = req.file.path.replace(/\\/g, "/");

  const command = `"C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe" -u root ${process.env.DB_NAME} < "${filePath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("Restore gagal:", err);
      return res.status(500).json({ error: "Restore database gagal!" });
    }

    res.json({ message: "Restore database berhasil" });
  });
});

// -----------------------------------------
// 🔄 3) RESTORE OTOMATIS (ambil file backup terbaru)
// -----------------------------------------
router.get("/restore/auto", (req, res) => {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith(".sql"))
    .map(f => ({
      file: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0)
    return res.status(404).json({ error: "Tidak ada file backup tersedia" });

  const latest = files[0].file;
  const latestPath = path.join(BACKUP_DIR, latest).replace(/\\/g, "/");

  const command = `"C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe" -u root ${process.env.DB_NAME} < "${latestPath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("Restore otomatis gagal:", err);
      return res.status(500).json({ error: "Restore otomatis gagal!" });
    }

    res.json({
      message: `Restore otomatis berhasil dari file: ${latest}`
    });
  });
});

module.exports = router;