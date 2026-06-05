const db = require("../models");
const socketService = require("../sockets/socket.service");

// Get all boats
exports.getAllBoats = async (req, res, next) => {
  try {
    const boats = await db.Boat.findAll();
    res.json({
      success: true,
      data: boats
    });
  } catch (err) {
    next(err);
  }
};

// Get a single boat by ID
exports.getBoatById = async (req, res, next) => {
  try {
    const boat = await db.Boat.findByPk(req.params.id);
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: "Boat not found"
      });
    }
    res.json({
      success: true,
      data: boat
    });
  } catch (err) {
    next(err);
  }
};

// Create a new boat
exports.createBoat = async (req, res, next) => {
  try {
    const { boatId, ownerName, registrationNumber, status } = req.body;
    
    // Check if boatId already exists
    const existingBoat = await db.Boat.findOne({ where: { boatId } });
    if (existingBoat) {
      return res.status(400).json({
        success: false,
        message: `Boat with ID '${boatId}' already exists.`
      });
    }

    const newBoat = await db.Boat.create({
      boatId,
      ownerName,
      registrationNumber,
      status: status || "SAFE"
    });

    res.status(201).json({
      success: true,
      data: newBoat
    });
  } catch (err) {
    next(err);
  }
};

// Update a boat
exports.updateBoat = async (req, res, next) => {
  try {
    const boat = await db.Boat.findByPk(req.params.id);
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: "Boat not found"
      });
    }

    const { status, lastLatitude, lastLongitude, signalStrength, batteryLevel } = req.body;
    const oldStatus = boat.status;

    // Update properties if provided
    if (status) boat.status = status;
    if (lastLatitude !== undefined) boat.lastLatitude = lastLatitude;
    if (lastLongitude !== undefined) boat.lastLongitude = lastLongitude;
    if (signalStrength !== undefined) boat.signalStrength = signalStrength;
    if (batteryLevel !== undefined) boat.batteryLevel = batteryLevel;

    await boat.save();

    // Trigger Socket.IO broadcasts based on what changed
    if (lastLatitude !== undefined || lastLongitude !== undefined) {
      // Also add to location history if updated via API
      await db.LocationHistory.create({
        boatId: boat.boatId,
        latitude: boat.lastLatitude,
        longitude: boat.lastLongitude
      });

      socketService.emitBoatLocationUpdated({
        boatId: boat.boatId,
        lastLatitude: boat.lastLatitude,
        lastLongitude: boat.lastLongitude,
        batteryLevel: boat.batteryLevel,
        signalStrength: boat.signalStrength,
        status: boat.status,
        timestamp: new Date()
      });
    }

    if (status && oldStatus !== status) {
      socketService.emitBoatStatusChanged({
        boatId: boat.boatId,
        status: boat.status
      });
    }

    res.json({
      success: true,
      data: boat
    });
  } catch (err) {
    next(err);
  }
};

// Delete a boat
exports.deleteBoat = async (req, res, next) => {
  try {
    const boat = await db.Boat.findByPk(req.params.id);
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: "Boat not found"
      });
    }

    await boat.destroy();
    res.json({
      success: true,
      message: "Boat deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
