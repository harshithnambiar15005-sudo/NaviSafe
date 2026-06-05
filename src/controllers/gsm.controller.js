const db = require("../models");
const socketService = require("../sockets/socket.service");

// Fallback Distress Receiver from SIM900A GSM module
exports.receiveGsmDistress = async (req, res, next) => {
  try {
    const { boatId, lat, lng, message } = req.body;

    console.log(`[GSM Fallback Distress Received] Boat: ${boatId} | Lat: ${lat} | Lng: ${lng} | Msg: ${message}`);

    // 1. Find or create Boat
    let [boat, created] = await db.Boat.findOrCreate({
      where: { boatId },
      defaults: {
        ownerName: "Unknown Owner (GSM Entry)",
        registrationNumber: `REG-GSM-${boatId}`,
        status: "DISTRESS",
        lastLatitude: lat,
        lastLongitude: lng
      }
    });

    // 2. Mark Boat as DISTRESS and update coordinates
    const oldStatus = boat.status;
    boat.status = "DISTRESS";
    boat.lastLatitude = lat;
    boat.lastLongitude = lng;
    await boat.save();

    // 3. Store Distress Alert in database
    const alert = await db.DistressAlert.create({
      boatId,
      latitude: lat,
      longitude: lng,
      message: message || "SOS (GSM Fallback)"
    });

    // 4. Broadcast Socket.IO events
    socketService.emitDistressAlert(alert);
    if (oldStatus !== "DISTRESS") {
      socketService.emitBoatStatusChanged({
        boatId,
        status: "DISTRESS"
      });
    }

    // 5. Return success response
    res.status(200).json({
      success: true,
      message: "GSM Distress Alert processed and broadcasted successfully",
      data: alert
    });
  } catch (err) {
    next(err);
  }
};
