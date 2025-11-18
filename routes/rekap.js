const express = require("express");
const router = express.Router();
const { getRekapBulanan } = require("../controllers/rekapController");
const pool = require("../config/db");

router.get("/bulanan", getRekapBulanan);

module.exports = router;