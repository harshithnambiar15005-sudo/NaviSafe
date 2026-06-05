const express = require("express");
const router = express.Router();
const rescueController = require("../controllers/rescue.controller");
const { validateRescueCreate, validateRescueUpdate } = require("../middleware/validation");

router.get("/", rescueController.getAllMissions);
router.post("/", validateRescueCreate, rescueController.createMission);
router.patch("/:id", validateRescueUpdate, rescueController.updateMission);

module.exports = router;
