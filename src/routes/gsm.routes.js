const express = require("express");
const router = express.Router();
const gsmController = require("../controllers/gsm.controller");
const { validateDistressCreate } = require("../middleware/validation");

router.post("/distress", validateDistressCreate, gsmController.receiveGsmDistress);

module.exports = router;
