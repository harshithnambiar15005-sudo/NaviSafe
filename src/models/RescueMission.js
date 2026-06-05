const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RescueMission = sequelize.define("RescueMission", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    distressBoatId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rescueBoatId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED"),
      defaultValue: "ASSIGNED",
      allowNull: false,
    },
    assignedTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    completedTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return RescueMission;
};
