const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Boat = sequelize.define("Boat", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    boatId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("SAFE", "DISTRESS", "RESCUED", "OFFLINE", "LOW_SIGNAL"),
      defaultValue: "SAFE",
      allowNull: false,
    },
    lastLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lastLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    signalStrength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    batteryLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  return Boat;
};
