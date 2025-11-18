const express = require("express");
const router = express.Router();
const { getRekapGaji, simpanRekapGaji } = require("../controllers/rekapGajiController");

router.get("/bulanan", getRekapGaji);
router.post("/simpan", simpanRekapGaji);

module.exports = router;