const express = require("express");
const router = express.Router();

const boatRoutes = require("./boat.routes");
const locationRoutes = require("./location.routes");
const distressRoutes = require("./distress.routes");
const rescueRoutes = require("./rescue.routes");
const analyticsRoutes = require("./analytics.routes");
const gsmRoutes = require("./gsm.routes");

router.use("/boats", boatRoutes);
router.use("/locations", locationRoutes);
router.use("/distress", distressRoutes);
router.use("/rescue", rescueRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/gsm", gsmRoutes);

module.exports = router;
