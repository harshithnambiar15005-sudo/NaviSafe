const db = require("../models");

/**
 * Generate heatmap data using distress alert history density
 * Group coordinates by rounding to 3 decimal places (approx. 110 meters accuracy)
 * Returns array of [latitude, longitude, intensity]
 */
exports.getHeatmapData = async () => {
  const alerts = await db.DistressAlert.findAll({
    attributes: ["latitude", "longitude"]
  });

  const clusters = {};

  alerts.forEach((alert) => {
    // Round to 3 decimal places to create standard density grid cells
    const latKey = parseFloat(alert.latitude.toFixed(3));
    const lngKey = parseFloat(alert.longitude.toFixed(3));
    const key = `${latKey},${lngKey}`;

    if (clusters[key]) {
      clusters[key].intensity += 1;
    } else {
      clusters[key] = {
        lat: latKey,
        lng: lngKey,
        intensity: 1
      };
    }
  });

  // Convert to array format: [[lat, lng, intensity], ...]
  return Object.values(clusters).map((c) => [c.lat, c.lng, c.intensity]);
};

/**
 * Get distress frequency stats (e.g., number of distress alerts per boat)
 */
exports.getDistressFrequency = async () => {
  const stats = await db.DistressAlert.findAll({
    attributes: [
      "boatId",
      [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "alertCount"]
    ],
    group: ["boatId"],
    order: [[db.Sequelize.literal("1"), "DESC"]]
  });

  return stats;
};

/**
 * Get rescue mission statistics (completed, assigned, in progress, failed counts)
 */
exports.getRescueStats = async () => {
  const stats = await db.RescueMission.findAll({
    attributes: [
      "status",
      [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "count"]
    ],
    group: ["status"]
  });

  // Format as a simple key-value object
  const formattedStats = {
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    FAILED: 0
  };

  stats.forEach((s) => {
    const data = s.toJSON();
    formattedStats[data.status] = parseInt(data.count, 10);
  });

  return formattedStats;
};
