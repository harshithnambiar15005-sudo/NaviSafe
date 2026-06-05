const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mqtt = require("mqtt");

// ----------------------------------------------------
// SERVER & SOCKET.IO SETUP
// ----------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// ----------------------------------------------------
// IN-MEMORY DATA STORAGE
// ----------------------------------------------------
// Stores the latest status of each boat: { boatId: { boatId, lastLatitude, lastLongitude, batteryLevel, signalStrength, status, updatedAt } }
const boats = {};

// Stores distress logs: [ { id, boatId, latitude, longitude, message, alertTime } ]
const distressAlerts = [];

// Helper to update boat data in memory and broadcast status changes
const updateBoatInMemory = (boatId, updates) => {
  const existing = boats[boatId] || {
    boatId,
    status: "SAFE",
    lastLatitude: null,
    lastLongitude: null,
    batteryLevel: null,
    signalStrength: null,
  };

  const oldStatus = existing.status;
  
  // Merge updates
  boats[boatId] = {
    ...existing,
    ...updates,
    updatedAt: new Date()
  };

  const updatedBoat = boats[boatId];

  // Broadcast coordinate telemetry updates
  if (updates.lastLatitude !== undefined && updates.lastLongitude !== undefined) {
    io.emit("boatLocationUpdated", {
      boatId,
      lastLatitude: updatedBoat.lastLatitude,
      lastLongitude: updatedBoat.lastLongitude,
      batteryLevel: updatedBoat.batteryLevel,
      signalStrength: updatedBoat.signalStrength,
      status: updatedBoat.status,
      timestamp: updatedBoat.updatedAt
    });
  }

  // Broadcast status change updates
  if (updates.status && updates.status !== oldStatus) {
    io.emit("boatStatusChanged", {
      boatId,
      status: updatedBoat.status
    });
  }

  return updatedBoat;
};

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. GET /boats - Retrieve list of all boats tracked in memory
app.get("/boats", (req, res) => {
  res.json({
    success: true,
    data: Object.values(boats)
  });
});

// 2. GET /distress - Retrieve list of all distress alerts log
app.get("/distress", (req, res) => {
  res.json({
    success: true,
    data: distressAlerts
  });
});

// 3. POST /distress - SIM900A GSM Fallback distress route
// Receives distress updates directly over HTTP when LoRa connectivity fails
app.post("/distress", (req, res) => {
  const { boatId, lat, lng, message } = req.body;

  if (!boatId || lat === undefined || lng === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing boatId, lat, or lng in distress request payload"
    });
  }

  // Create distress alert log object
  const newAlert = {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    boatId,
    latitude: parseFloat(lat),
    longitude: parseFloat(lng),
    message: message || "SOS (GSM Fallback)",
    alertTime: new Date()
  };

  distressAlerts.unshift(newAlert); // add to top of memory log

  // Update boat in memory and change status to DISTRESS
  updateBoatInMemory(boatId, {
    status: "DISTRESS",
    lastLatitude: parseFloat(lat),
    lastLongitude: parseFloat(lng)
  });

  // Emit Socket.IO alert
  io.emit("distressAlert", newAlert);

  console.log(`[GSM HTTP Fallback SOS] Raised distress for ${boatId}`);

  res.json({
    success: true,
    message: "Distress alert received and broadcasted successfully",
    data: newAlert
  });
});

// Backward compatibility helper endpoint
app.post("/boat-data", (req, res) => {
  const boatData = req.body;
  const { boatId, lat, lng, battery, signal, status } = boatData;

  if (boatId) {
    updateBoatInMemory(boatId, {
      lastLatitude: lat !== undefined ? parseFloat(lat) : undefined,
      lastLongitude: lng !== undefined ? parseFloat(lng) : undefined,
      batteryLevel: battery !== undefined ? parseInt(battery) : undefined,
      signalStrength: signal !== undefined ? parseInt(signal) : undefined,
      status: status || undefined
    });
  }

  res.json({
    success: true,
  });
});

// ----------------------------------------------------
// MQTT CLIENT SETUP & SUBSCRIPTIONS
// ----------------------------------------------------
const MQTT_BROKER = process.env.MQTT_URL || "mqtt://localhost:1883";
console.log(`Connecting to MQTT broker: ${MQTT_BROKER}`);

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("MQTT client connected to broker");
  
  // Subscribe to required LoRa topics
  mqttClient.subscribe(["boats/location", "boats/distress"], (err) => {
    if (err) {
      console.error("MQTT Subscription error:", err);
    } else {
      console.log("Subscribed to MQTT topics: boats/location, boats/distress");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  const payloadStr = message.toString();
  console.log(`[MQTT Received] Topic: ${topic} | Message: ${payloadStr}`);

  try {
    const data = JSON.parse(payloadStr);

    if (topic === "boats/location") {
      // 4. MQTT boats/location integration
      // Payload format: { "boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "battery": 87, "signal": 75 }
      const { boatId, lat, lng, battery, signal } = data;
      if (boatId && lat !== undefined && lng !== undefined) {
        updateBoatInMemory(boatId, {
          lastLatitude: parseFloat(lat),
          lastLongitude: parseFloat(lng),
          batteryLevel: battery !== undefined ? parseInt(battery) : undefined,
          signalStrength: signal !== undefined ? parseInt(signal) : undefined
        });
      }
    } else if (topic === "boats/distress") {
      // 5. MQTT boats/distress integration
      // Payload format: { "boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "message": "SOS" }
      const { boatId, lat, lng, message } = data;
      if (boatId && lat !== undefined && lng !== undefined) {
        // Create alert log object
        const newAlert = {
          id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          boatId,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          message: message || "SOS",
          alertTime: new Date()
        };

        distressAlerts.unshift(newAlert);

        // Update boat to DISTRESS state
        updateBoatInMemory(boatId, {
          status: "DISTRESS",
          lastLatitude: parseFloat(lat),
          lastLongitude: parseFloat(lng)
        });

        // Emit Socket.IO updates
        io.emit("distressAlert", newAlert);
      }
    }
  } catch (error) {
    console.error("Error parsing MQTT topic payload:", error.message);
  }
});

mqttClient.on("error", (error) => {
  console.error("MQTT client connection error:", error);
});

// ----------------------------------------------------
// SERVER START
// ----------------------------------------------------
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});