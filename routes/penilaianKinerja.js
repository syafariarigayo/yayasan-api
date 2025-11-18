const express = require("express");
const router = express.Router();
const controller = require("../controllers/penilaianKinerjaController");

// CRUD Penilaian
router.get("/", controller.listPenilaian);
router.get("/:id", controller.getPenilaian);
router.post("/", controller.createPenilaian);
router.put("/:id", controller.updatePenilaian);
router.delete("/:id", controller.deletePenilaian);

// Actions
router.post("/:id/finalisasi", controller.finalisasiPenilaian);
router.get("/statistik/:karyawan_id", controller.statistikKaryawan);
router.get("/rekap/periode", controller.rekapPerPeriode);

module.exports = router;