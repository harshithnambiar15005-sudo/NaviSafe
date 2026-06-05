const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");

router.get("/latest", locationController.getLatestLocations);
router.get("/history/:boatId", locationController.getLocationHistory);

module.exports = router;
