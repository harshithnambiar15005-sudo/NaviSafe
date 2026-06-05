const mqtt = require("mqtt");

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
console.log(`Connecting to MQTT broker at: ${brokerUrl}`);

const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log("Mock Publisher connected to broker!");
  console.log("Starting telemetry stream simulation (Ctrl+C to stop)...");

  let lat = 9.28;
  let lng = 79.55;

  // Publish boat locations every 5 seconds
  setInterval(() => {
    // Add small random variations to coordinates
    lat += (Math.random() - 0.5) * 0.005;
    lng += (Math.random() - 0.5) * 0.005;
    const signal = Math.floor(Math.random() * 40) + 50; // 50 to 90
    const battery = Math.max(10, Math.floor(95 - (Math.random() * 2)));

    const payload = {
      boatId: "BOAT_12",
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
      battery,
      signal
    };

    client.publish("boats/location", JSON.stringify(payload));
    console.log(`[Published] Topic: boats/location | Payload:`, payload);
  }, 5000);

  // Periodically send a mesh relay path update
  setInterval(() => {
    const payload = {
      source: "BOAT_12",
      relay: "BOAT_01",
      destination: "COASTAL_STATION"
    };
    client.publish("boats/relay", JSON.stringify(payload));
    console.log(`[Published] Topic: boats/relay | Payload:`, payload);
  }, 12000);

  // Publish a distress signal after 10 seconds (one-shot)
  setTimeout(() => {
    const payload = {
      boatId: "BOAT_12",
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
      message: "SOS! Battery critically low or engines failed!"
    };
    client.publish("boats/distress", JSON.stringify(payload));
    console.log(`[Published] Topic: boats/distress | Payload:`, payload);
  }, 10000);
});

client.on("error", (err) => {
  console.error("MQTT Publisher error:", err);
});
