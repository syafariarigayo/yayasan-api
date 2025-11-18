const express = require("express");
const router = express.Router();
const {
  listMagang,
  verifikasiMagang,
  getRiwayatMagang
} = require("../controllers/karyawanController");

// List karyawan magang
router.get("/", listMagang);

// Verifikasi magang (lulus/tidak lulus)
router.post("/:id/verifikasi", verifikasiMagang);

// Get riwayat magang per karyawan
router.get("/riwayat/:karyawan_id", getRiwayatMagang);

module.exports = router;