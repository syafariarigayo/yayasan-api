const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  createKaryawan,
  listKaryawan,
  getKaryawan,
  updateKaryawan,
  deleteKaryawan
} = require('../controllers/karyawanController');

require('dotenv').config();
const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");

// ==============================
// MULTER CONFIG (UPDATE!)
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

// ==============================
// ROUTES
// ==============================

// GET all karyawan
router.get("/", listKaryawan);

// GET karyawan by ID
router.get("/:id", getKaryawan);

// CREATE karyawan (dengan multiple file upload)
router.post(
  "/",
  upload.fields([
    { name: "foto_ktp", maxCount: 1 },
    { name: "foto_buku_rekening", maxCount: 1 },
    { name: "foto_profil", maxCount: 1 },
    { name: "file_kk", maxCount: 1 },
    { name: "file_akta_kelahiran", maxCount: 1 },
    { name: "file_pas_foto", maxCount: 1 },
    { name: "file_buku_nikah", maxCount: 1 },
    { name: "file_npwp", maxCount: 1 },
    { name: "file_ijazah", maxCount: 10 },
    { name: "file_sertifikat", maxCount: 10 },
  ]),
  createKaryawan
);

// UPDATE karyawan
router.put(
  "/:id",
  upload.fields([
    { name: "foto_ktp", maxCount: 1 },
    { name: "foto_buku_rekening", maxCount: 1 },
    { name: "foto_profil", maxCount: 1 },
  ]),
  updateKaryawan
);

// DELETE karyawan
router.delete("/:id", deleteKaryawan);

module.exports = router;