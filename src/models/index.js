const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Boat = require("./Boat")(sequelize);
db.LocationHistory = require("./LocationHistory")(sequelize);
db.DistressAlert = require("./DistressAlert")(sequelize);
db.RescueMission = require("./RescueMission")(sequelize);
db.RelayPath = require("./RelayPath")(sequelize);

// Set up associations using boatId string field
db.Boat.hasMany(db.LocationHistory, { foreignKey: "boatId", sourceKey: "boatId", as: "locations" });
db.LocationHistory.belongsTo(db.Boat, { foreignKey: "boatId", targetKey: "boatId", as: "boat" });

db.Boat.hasMany(db.DistressAlert, { foreignKey: "boatId", sourceKey: "boatId", as: "alerts" });
db.DistressAlert.belongsTo(db.Boat, { foreignKey: "boatId", targetKey: "boatId", as: "boat" });

db.Boat.hasMany(db.RescueMission, { foreignKey: "distressBoatId", sourceKey: "boatId", as: "distressMissions" });
db.Boat.hasMany(db.RescueMission, { foreignKey: "rescueBoatId", sourceKey: "boatId", as: "rescueMissions" });

db.RescueMission.belongsTo(db.Boat, { foreignKey: "distressBoatId", targetKey: "boatId", as: "distressBoat" });
db.RescueMission.belongsTo(db.Boat, { foreignKey: "rescueBoatId", targetKey: "boatId", as: "rescueBoat" });

module.exports = db;
