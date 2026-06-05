const mqtt = require("mqtt");
const db = require("../models");
const socketService = require("../sockets/socket.service");

let client;

const initMQTT = () => {
  const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
  console.log(`Connecting to MQTT broker at: ${brokerUrl}`);

  client = mqtt.connect(brokerUrl);

  client.on("connect", () => {
    console.log("MQTT Client connected successfully");
    
    // Subscribe to all specified topics
    const topics = [
      "boats/location",
      "boats/distress",
      "boats/status",
      "boats/relay"
    ];
    
    client.subscribe(topics, (err) => {
      if (err) {
        console.error("Failed to subscribe to MQTT topics:", err);
      } else {
        console.log(`Subscribed to MQTT topics: ${topics.join(", ")}`);
      }
    });
  });

  client.on("message", async (topic, message) => {
    const payloadStr = message.toString();
    console.log(`[MQTT Received] Topic: ${topic} | Payload: ${payloadStr}`);
    
    try {
      const payload = JSON.parse(payloadStr);

      switch (topic) {
        case "boats/location":
          await handleLocationUpdate(payload);
          break;
        case "boats/distress":
          await handleDistressAlert(payload);
          break;
        case "boats/status":
          await handleStatusChange(payload);
          break;
        case "boats/relay":
          await handleRelayPath(payload);
          break;
        default:
          console.warn(`Unhandled topic: ${topic}`);
      }
    } catch (err) {
  console.error("FULL MQTT ERROR:");
  console.error(err);
}
  });

  client.on("error", (err) => {
    console.error("MQTT Client connection error:", err);
  });
};

/**
 * Handle boats/location topic
 * Payload: { "boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "battery": 87, "signal": 75 }
 */
async function handleLocationUpdate(payload) {
  const { boatId, lat, lng, battery, signal } = payload;
  if (!boatId) return;
  console.log("DB OBJECT:");
console.log(Object.keys(db));
  // Find or create Boat
  let [boat, created] = await db.Boat.findOrCreate({
    where: { boatId },
    defaults: {
      ownerName: "Unknown Owner",
      registrationNumber: `REG-${boatId}`,
      status: "SAFE",
      lastLatitude: lat,
      lastLongitude: lng,
      signalStrength: signal,
      batteryLevel: battery
    }
  });

  if (!created) {
    boat.lastLatitude = lat;
    boat.lastLongitude = lng;
    if (battery !== undefined) boat.batteryLevel = battery;
    if (signal !== undefined) boat.signalStrength = signal;
    await boat.save();
  }

  // Create location history record
  const history = await db.LocationHistory.create({
    boatId,
    latitude: lat,
    longitude: lng
  });

  // Emit event via Socket.IO
  socketService.emitBoatLocationUpdated({
    boatId,
    lastLatitude: lat,
    lastLongitude: lng,
    batteryLevel: boat.batteryLevel,
    signalStrength: boat.signalStrength,
    status: boat.status,
    timestamp: history.timestamp
  });
}

/**
 * Handle boats/distress topic
 * Payload: { "boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "message": "SOS" }
 */
async function handleDistressAlert(payload) {
  const { boatId, lat, lng, message } = payload;
  if (!boatId) return;

  // Find or create Boat
  let [boat, created] = await db.Boat.findOrCreate({
    where: { boatId },
    defaults: {
      ownerName: "Unknown Owner",
      registrationNumber: `REG-${boatId}`,
      status: "DISTRESS",
      lastLatitude: lat,
      lastLongitude: lng
    }
  });

  // Update status and last location
  const oldStatus = boat.status;
  boat.status = "DISTRESS";
  boat.lastLatitude = lat;
  boat.lastLongitude = lng;
  await boat.save();

  // Create Distress Alert log entry
  const alert = await db.DistressAlert.create({
    boatId,
    latitude: lat,
    longitude: lng,
    message: message || "SOS"
  });

  // Emit events via Socket.IO
  socketService.emitDistressAlert(alert);
  if (oldStatus !== "DISTRESS") {
    socketService.emitBoatStatusChanged({
      boatId,
      status: "DISTRESS"
    });
  }
}

/**
 * Handle boats/status topic
 * Payload: { "boatId": "BOAT_12", "status": "SAFE" }
 */
async function handleStatusChange(payload) {
  const { boatId, status } = payload;
  if (!boatId || !status) return;

  const boat = await db.Boat.findOne({ where: { boatId } });
  if (!boat) {
    console.warn(`Boat status change failed: Boat ${boatId} not found.`);
    return;
  }

  const oldStatus = boat.status;
  boat.status = status;
  await boat.save();

  if (oldStatus !== status) {
    socketService.emitBoatStatusChanged({
      boatId,
      status
    });
  }
}

/**
 * Handle boats/relay topic
 * Payload: { "source": "BOAT_A", "relay": "BOAT_B", "destination": "COASTAL_STATION" }
 */
async function handleRelayPath(payload) {
  const { source, relay, destination } = payload;
  if (!source || !relay || !destination) return;

  const relayPath = await db.RelayPath.create({
    sourceBoat: source,
    relayBoat: relay,
    destination
  });

  // Emit event via Socket.IO
  socketService.emitRelayPathUpdated(relayPath);
}

module.exports = {
  initMQTT,
  getClient: () => client
};
