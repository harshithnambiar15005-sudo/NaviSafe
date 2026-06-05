const express = require("express");
const router = express.Router();
const boatController = require("../controllers/boat.controller");
const { validateBoatCreate, validateBoatUpdate } = require("../middleware/validation");

router.get("/", boatController.getAllBoats);
router.get("/:id", boatController.getBoatById);
router.post("/", validateBoatCreate, boatController.createBoat);
router.put("/:id", validateBoatUpdate, boatController.updateBoat);
router.delete("/:id", boatController.deleteBoat);

module.exports = router;
