"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Boat Table
    await queryInterface.createTable("Boats", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      boatId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      ownerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM("SAFE", "DISTRESS", "RESCUED", "OFFLINE", "LOW_SIGNAL"),
        defaultValue: "SAFE",
        allowNull: false
      },
      lastLatitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      lastLongitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      signalStrength: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      batteryLevel: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 2. LocationHistory Table
    await queryInterface.createTable("LocationHistories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      boatId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 3. DistressAlert Table
    await queryInterface.createTable("DistressAlerts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      boatId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      alertTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false
      },
      resolved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      resolvedTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. RescueMission Table
    await queryInterface.createTable("RescueMissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      distressBoatId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rescueBoatId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED"),
        defaultValue: "ASSIGNED",
        allowNull: false
      },
      assignedTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false
      },
      completedTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. RelayPath Table
    await queryInterface.createTable("RelayPaths", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      sourceBoat: {
        type: Sequelize.STRING,
        allowNull: false
      },
      relayBoat: {
        type: Sequelize.STRING,
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RelayPaths");
    await queryInterface.dropTable("RescueMissions");
    await queryInterface.dropTable("DistressAlerts");
    await queryInterface.dropTable("LocationHistories");
    await queryInterface.dropTable("Boats");
  }
};
