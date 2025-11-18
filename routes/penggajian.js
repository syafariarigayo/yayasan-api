const express = require("express");
const router = express.Router();
const penggajian = require("../controllers/penggajianController");

router.post("/hitung", penggajian.hitungGajiBulanan);

module.exports = router;