const express = require("express");
const router = express.Router();
const controller = require("../controllers/pasanganAnakController");

// PASANGAN
router.get("/pasangan/:karyawan_id", controller.getPasangan);
router.post("/pasangan/:karyawan_id", controller.savePasangan);
router.delete("/pasangan/:karyawan_id", controller.deletePasangan);

// ANAK
router.get("/anak/:karyawan_id", controller.listAnak);
router.post("/anak/:karyawan_id", controller.createAnak);
router.put("/anak/:id", controller.updateAnak);
router.delete("/anak/:id", controller.deleteAnak);

module.exports = router;