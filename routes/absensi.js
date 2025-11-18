const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const pool = require("../config/db");

// -------------------------
// Konfigurasi upload Excel
// -------------------------
const upload = multer({ dest: "uploads/" });

// -------------------------
// GET semua absensi
// -------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, k.nama, a.tanggal, a.jam_masuk, a.jam_pulang, a.status 
      FROM absensi a
      LEFT JOIN karyawan k ON a.karyawan_id = k.id
      ORDER BY a.tanggal DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET ABSENSI ERROR:", err);
    res.status(500).json({ error: "Gagal mengambil data absensi" });
  }
});

// -------------------------
// IMPORT ABSENSI
// -------------------------
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (let row of rows) {
      await pool.query(
        `INSERT INTO absensi (karyawan_id, tanggal, jam_masuk, jam_pulang, status, keterangan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          row.karyawan_id,
          row.tanggal,
          row.jam_masuk,
          row.jam_pulang,
          row.status,
          row.keterangan || null
        ]
      );
    }

    res.json({ message: "Import berhasil", total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal import absensi" });
  }
});

module.exports = router;