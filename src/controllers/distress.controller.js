const db = require("../models");
const socketService = require("../sockets/socket.service");

// Get all distress alerts
exports.getAllDistress = async (req, res, next) => {
  try {
    const alerts = await db.DistressAlert.findAll({
      order: [["alertTime", "DESC"]],
      include: [
        {
          model: db.Boat,
          as: "boat",
          attributes: ["ownerName", "registrationNumber", "status"]
        }
      ]
    });
    res.json({
      success: true,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

// Manually trigger a distress alert
exports.createDistress = async (req, res, next) => {
  try {
    const { boatId, lat, lng, message } = req.body;

    // Check if boat exists
    let boat = await db.Boat.findOne({ where: { boatId } });
    if (!boat) {
      // Create a dummy boat if it doesn't exist
      boat = await db.Boat.create({
        boatId,
        ownerName: "Unknown Owner",
        registrationNumber: `REG-${boatId}`,
        status: "DISTRESS",
        lastLatitude: lat,
        lastLongitude: lng
      });
    } else {
      boat.status = "DISTRESS";
      boat.lastLatitude = lat;
      boat.lastLongitude = lng;
      await boat.save();
    }

    const alert = await db.DistressAlert.create({
      boatId,
      latitude: lat,
      longitude: lng,
      message: message || "Manual SOS Distress Alert"
    });

    // Emit Socket.IO broadcasts
    socketService.emitDistressAlert(alert);
    socketService.emitBoatStatusChanged({
      boatId,
      status: "DISTRESS"
    });

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

// Resolve a distress alert
exports.resolveDistress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await db.DistressAlert.findByPk(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Distress alert not found"
      });
    }

    if (alert.resolved) {
      return res.status(400).json({
        success: false,
        message: "Distress alert is already resolved"
      });
    }

    // Resolve alert
    alert.resolved = true;
    alert.resolvedTime = new Date();
    await alert.save();

    // Update Boat Status to RESCUED
    const boat = await db.Boat.findOne({ where: { boatId: alert.boatId } });
    if (boat) {
      boat.status = "RESCUED";
      await boat.save();

      // Emit status change socket event
      socketService.emitBoatStatusChanged({
        boatId: boat.boatId,
        status: "RESCUED"
      });
    }

    res.json({
      success: true,
      message: "Distress alert resolved successfully",
      data: alert
    });
  } catch (err) {
    next(err);
  }
};
