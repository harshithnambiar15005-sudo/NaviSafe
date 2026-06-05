const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RelayPath = sequelize.define("RelayPath", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sourceBoat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relayBoat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  });

  return RelayPath;
};
