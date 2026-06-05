require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
//const db = require("./models");
const socketService = require("./sockets/socket.service");
const { initMQTT } = require("./mqtt/mqtt.client");

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust origins in production if needed
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Bind socket service
socketService.init(io);

// Connect to Database and start server
const startServer = async () => {
  try {

    console.log("Starting Maritime Backend...");

    // Start MQTT
    initMQTT();

    // Start HTTP Server
    server.listen(PORT, () => {
      console.log("=================================");
      console.log("MARITIME BACKEND RUNNING");
      console.log(`http://localhost:${PORT}`);
      console.log("=================================");
    });

  } catch (error) {

    console.error("Server startup error:", error);

  }
};  

startServer();
