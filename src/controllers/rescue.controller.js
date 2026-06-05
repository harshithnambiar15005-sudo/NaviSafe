const db = require("../models");
const socketService = require("../sockets/socket.service");

// Get all rescue missions
exports.getAllMissions = async (req, res, next) => {
  try {
    const missions = await db.RescueMission.findAll({
      order: [["assignedTime", "DESC"]],
      include: [
        {
          model: db.Boat,
          as: "distressBoat",
          attributes: ["ownerName", "registrationNumber", "status"]
        },
        {
          model: db.Boat,
          as: "rescueBoat",
          attributes: ["ownerName", "registrationNumber", "status"]
        }
      ]
    });
    res.json({
      success: true,
      data: missions
    });
  } catch (err) {
    next(err);
  }
};

// Create a new rescue mission assignment
exports.createMission = async (req, res, next) => {
  try {
    const { distressBoatId, rescueBoatId } = req.body;

    // Check if distress boat exists
    const distressBoat = await db.Boat.findOne({ where: { boatId: distressBoatId } });
    if (!distressBoat) {
      return res.status(404).json({
        success: false,
        message: `Distress boat with ID '${distressBoatId}' not found.`
      });
    }

    // Check if rescue boat exists
    const rescueBoat = await db.Boat.findOne({ where: { boatId: rescueBoatId } });
    if (!rescueBoat) {
      return res.status(404).json({
        success: false,
        message: `Rescue boat with ID '${rescueBoatId}' not found.`
      });
    }

    // Create mission
    const mission = await db.RescueMission.create({
      distressBoatId,
      rescueBoatId,
      status: "ASSIGNED",
      assignedTime: new Date()
    });

    // Update distress boat status if it's currently DISTRESS (or keep tracking)
    // Maybe set rescue boat status? We don't have to but let's keep it.
    
    // Broadcast via Socket.IO
    socketService.emitRescueMissionAssigned(mission);

    res.status(201).json({
      success: true,
      data: mission
    });
  } catch (err) {
    next(err);
  }
};

// Update a rescue mission status
exports.updateMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const mission = await db.RescueMission.findByPk(id);
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: "Rescue mission not found"
      });
    }

    const oldStatus = mission.status;
    mission.status = status;

    if (status === "COMPLETED" || status === "FAILED") {
      mission.completedTime = new Date();
    }

    await mission.save();

    // Broadcast update
    if (status === "COMPLETED") {
      // Set the distress boat status to RESCUED automatically if mission is completed
      const distressBoat = await db.Boat.findOne({ where: { boatId: mission.distressBoatId } });
      if (distressBoat) {
        distressBoat.status = "RESCUED";
        await distressBoat.save();

        socketService.emitBoatStatusChanged({
          boatId: distressBoat.boatId,
          status: "RESCUED"
        });
      }

      socketService.emitRescueMissionCompleted(mission);
    } else {
      // General update (e.g. IN_PROGRESS or FAILED)
      socketService.emit("rescueMissionUpdated", mission);
    }

    res.json({
      success: true,
      data: mission
    });
  } catch (err) {
    next(err);
  }
};
