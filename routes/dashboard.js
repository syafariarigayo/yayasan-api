const express = require("express");
const router = express.Router();

// pastikan path benar!
const dashboardController = require("../controllers/dashboardController");

// GET /dashboard/summary
router.get("/summary", dashboardController.getSummary);

module.exports = router;