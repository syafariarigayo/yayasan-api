const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const XLSX = require("xlsx");
const pool = require("../config/db");

const upload = multer({ dest: "uploads/" });

router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "File tidak ditemukan" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let saved = 0;
    let skipped = 0;

    for (let row of rows) {

      // --- 1. CARI KARYAWAN_ID BERDASARKAN NAMA ---
      const [karyawan] = await pool.query(
        "SELECT id FROM karyawan WHERE nama = ?",
        [row.nama]
      );

      if (karyawan.length === 0) {
        console.log("❌ Tidak ditemukan:", row.nama);
        skipped++;
        continue;
      }

      const karyawan_id = karyawan[0].id;

      // --- 2. MASUKKAN ABSENSI ---
      await pool.query(
        `INSERT INTO absensi 
        (karyawan_id, tanggal, jam_masuk, jam_pulang, status, keterangan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          karyawan_id,
          row.tanggal,
          row.jam_masuk,
          row.jam_pulang,
          row.status,
          row.keterangan || null
        ]
      );

      saved++;
    }

    res.json({
      message: "Import selesai",
      disimpan: saved,
      dilewati: skipped
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal import absensi" });
  }
});

module.exports = router;