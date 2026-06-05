let io;

const socketService = {
  /**
   * Initialize Socket.IO server
   * @param {import("socket.io").Server} ioInstance 
   */
  init(ioInstance) {
    io = ioInstance;
    
    io.on("connection", (socket) => {
      console.log(`Dashboard client connected: ${socket.id}`);
      
      socket.on("disconnect", () => {
        console.log(`Dashboard client disconnected: ${socket.id}`);
      });
    });
  },

  /**
   * Broadcast an event to all dashboard clients
   * @param {string} event 
   * @param {any} data 
   */
  emit(event, data) {
    if (!io) {
      console.warn("Socket.IO not initialized yet. Skipping emit:", event);
      return;
    }
    io.emit(event, data);
    console.log(`[Socket.IO Broadcast] Event: ${event}`, data);
  },

  // Named emitters for consistency
  emitBoatLocationUpdated(boatData) {
    this.emit("boatLocationUpdated", boatData);
  },

  emitDistressAlert(alertData) {
    this.emit("distressAlert", alertData);
  },

  emitBoatStatusChanged(statusData) {
    this.emit("boatStatusChanged", statusData);
  },

  emitRescueMissionAssigned(missionData) {
    this.emit("rescueMissionAssigned", missionData);
  },

  emitRescueMissionCompleted(missionData) {
    this.emit("rescueMissionCompleted", missionData);
  },

  emitRelayPathUpdated(pathData) {
    this.emit("relayPathUpdated", pathData);
  }
};

module.exports = socketService;
