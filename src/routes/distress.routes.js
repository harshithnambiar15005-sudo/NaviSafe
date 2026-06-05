const express = require("express");
const router = express.Router();
const distressController = require("../controllers/distress.controller");
const { validateDistressCreate } = require("../middleware/validation");

router.get("/", distressController.getAllDistress);
router.post("/", validateDistressCreate, distressController.createDistress);
router.patch("/:id/resolve", distressController.resolveDistress);

module.exports = router;
