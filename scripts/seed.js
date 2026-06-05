require("dotenv").config();
const db = require("../src/models");

const seedDatabase = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await db.sequelize.authenticate();
    
    // Clear existing data (optional, but clean for seeds)
    await db.sequelize.sync({ force: true });
    console.log("Database tables recreated successfully.");

    // Seed Boats
    const boats = await db.Boat.bulkCreate([
      {
        boatId: "BOAT_01",
        ownerName: "John Doe",
        registrationNumber: "SL-BOAT-001",
        status: "SAFE",
        lastLatitude: 9.1245,
        lastLongitude: 79.4012,
        signalStrength: 85,
        batteryLevel: 92
      },
      {
        boatId: "BOAT_02",
        ownerName: "Jane Smith",
        registrationNumber: "SL-BOAT-002",
        status: "LOW_SIGNAL",
        lastLatitude: 9.3012,
        lastLongitude: 79.6045,
        signalStrength: 15,
        batteryLevel: 42
      },
      {
        boatId: "BOAT_03",
        ownerName: "Captain Nemo",
        registrationNumber: "SL-BOAT-003",
        status: "DISTRESS",
        lastLatitude: 9.2567,
        lastLongitude: 79.5023,
        signalStrength: 70,
        batteryLevel: 65
      },
      {
        boatId: "BOAT_04",
        ownerName: "Alan Walker",
        registrationNumber: "SL-BOAT-004",
        status: "SAFE",
        lastLatitude: 9.0834,
        lastLongitude: 79.3512,
        signalStrength: 90,
        batteryLevel: 88
      }
    ]);
    console.log(`Seeded ${boats.length} boats successfully.`);

    // Seed Location History for active boats
    await db.LocationHistory.bulkCreate([
      { boatId: "BOAT_01", latitude: 9.1200, longitude: 79.4000, timestamp: new Date(Date.now() - 3600000) },
      { boatId: "BOAT_01", latitude: 9.1245, longitude: 79.4012, timestamp: new Date() },
      { boatId: "BOAT_02", latitude: 9.2980, longitude: 79.6000, timestamp: new Date(Date.now() - 3600000) },
      { boatId: "BOAT_02", latitude: 9.3012, longitude: 79.6045, timestamp: new Date() },
      { boatId: "BOAT_03", latitude: 9.2500, longitude: 79.5000, timestamp: new Date(Date.now() - 3600000) },
      { boatId: "BOAT_03", latitude: 9.2567, longitude: 79.5023, timestamp: new Date() }
    ]);
    console.log("Seeded location history records.");

    // Seed Distress Alerts
    await db.DistressAlert.bulkCreate([
      {
        boatId: "BOAT_03",
        latitude: 9.2567,
        longitude: 79.5023,
        message: "SOS Engine failure and water entering cabin!",
        alertTime: new Date(),
        resolved: false
      },
      {
        boatId: "BOAT_01",
        latitude: 9.1120,
        longitude: 79.3980,
        message: "SOS Lost power steering",
        alertTime: new Date(Date.now() - 86400000),
        resolved: true,
        resolvedTime: new Date(Date.now() - 82800000)
      }
    ]);
    console.log("Seeded distress alerts.");

    // Seed Rescue Mission
    await db.RescueMission.create({
      distressBoatId: "BOAT_03",
      rescueBoatId: "BOAT_01",
      status: "ASSIGNED",
      assignedTime: new Date()
    });
    console.log("Seeded initial rescue mission.");

    // Seed Relay Paths
    await db.RelayPath.bulkCreate([
      { sourceBoat: "BOAT_03", relayBoat: "BOAT_02", destination: "COASTAL_STATION", timestamp: new Date() },
      { sourceBoat: "BOAT_02", relayBoat: "BOAT_01", destination: "COASTAL_STATION", timestamp: new Date() }
    ]);
    console.log("Seeded relay paths.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
