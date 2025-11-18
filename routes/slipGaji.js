const express = require("express");
const router = express.Router();
const { getSlipDetail, downloadSlipGaji } = require("../controllers/slipGajiController");

router.get("/:id", getSlipDetail);
router.get("/download/:id", downloadSlipGaji);

module.exports = router;