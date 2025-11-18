const express = require("express");
const router = express.Router();
const { hitungGaji } = require("../controllers/gajiController");

router.post("/hitung", hitungGaji);

module.exports = router;