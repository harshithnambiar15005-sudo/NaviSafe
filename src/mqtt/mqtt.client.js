const mqtt = require("mqtt");
const boats = {};
const distressAlerts = [];
const relayPaths = [];
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

  boats[boatId] = {
    boatId,
    lastLatitude: lat,
    lastLongitude: lng,
    batteryLevel: battery || 0,
    signalStrength: signal || 0,
    status: boats[boatId]?.status || "SAFE",
    timestamp: new Date()
  };

  socketService.emitBoatLocationUpdated({
    boatId,
    lastLatitude: lat,
    lastLongitude: lng,
    batteryLevel: battery || 0,
    signalStrength: signal || 0,
    status: boats[boatId].status,
    timestamp: boats[boatId].timestamp
  });

  console.log(`Location updated for ${boatId}`);
}
/**
 * Handle boats/distress topic
 * Payload: { "boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "message": "SOS" }
 */
async function handleDistressAlert(payload) {
  const { boatId, lat, lng, message } = payload;

  if (!boatId) return;

  boats[boatId] = {
    ...(boats[boatId] || {}),
    boatId,
    lastLatitude: lat,
    lastLongitude: lng,
    status: "DISTRESS"
  };

  const alert = {
    boatId,
    latitude: lat,
    longitude: lng,
    message: message || "SOS",
    timestamp: new Date()
  };

  distressAlerts.push(alert);

  socketService.emitDistressAlert(alert);

  socketService.emitBoatStatusChanged({
    boatId,
    status: "DISTRESS"
  });

  console.log(`DISTRESS ALERT from ${boatId}`);
}

/**
 * Handle boats/status topic
 * Payload: { "boatId": "BOAT_12", "status": "SAFE" }
 */
async function handleStatusChange(payload) {
  const { boatId, status } = payload;

  if (!boatId || !status) return;

  if (!boats[boatId]) {
    boats[boatId] = {
      boatId,
      status
    };
  } else {
    boats[boatId].status = status;
  }

  socketService.emitBoatStatusChanged({
    boatId,
    status
  });

  console.log(`Status changed: ${boatId} -> ${status}`);
}

/**
 * Handle boats/relay topic
 * Payload: { "source": "BOAT_A", "relay": "BOAT_B", "destination": "COASTAL_STATION" }
 */
async function handleRelayPath(payload) {
  const { source, relay, destination } = payload;

  if (!source || !relay || !destination) return;

  const relayPath = {
    source,
    relay,
    destination,
    timestamp: new Date()
  };

  relayPaths.push(relayPath);

  socketService.emitRelayPathUpdated(relayPath);

  console.log(`Relay path updated`);
}

module.exports = {
  initMQTT,
  getClient: () => client
};
