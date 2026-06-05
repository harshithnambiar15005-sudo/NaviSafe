const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");

router.get("/heatmap", analyticsController.getHeatmap);
router.get("/distress-frequency", analyticsController.getDistressFrequency);
router.get("/rescue-stats", analyticsController.getRescueStats);

module.exports = router;
