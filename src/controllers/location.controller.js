const db = require("../models");

// Get the latest locations of all boats
exports.getLatestLocations = async (req, res, next) => {
  try {
    // Select all boats where lastLatitude and lastLongitude are not null
    const boats = await db.Boat.findAll({
      attributes: [
        "boatId",
        "ownerName",
        "registrationNumber",
        "status",
        "lastLatitude",
        "lastLongitude",
        "signalStrength",
        "batteryLevel",
        "updatedAt"
      ]
    });
    
    // Format to only include boats that have telemetry
    const activeLocations = boats.filter(
      (b) => b.lastLatitude !== null && b.lastLongitude !== null
    );

    res.json({
      success: true,
      data: activeLocations
    });
  } catch (err) {
    next(err);
  }
};

// Get the historical locations of a specific boat
exports.getLocationHistory = async (req, res, next) => {
  try {
    const { boatId } = req.params;

    // Check if boat exists
    const boat = await db.Boat.findOne({ where: { boatId } });
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: `Boat with ID '${boatId}' not found.`
      });
    }

    const history = await db.LocationHistory.findAll({
      where: { boatId },
      order: [["timestamp", "DESC"]],
      limit: 100 // Capping at 100 for performance
    });

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};
