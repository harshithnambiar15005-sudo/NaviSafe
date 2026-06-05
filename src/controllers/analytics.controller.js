const analyticsService = require("../services/analytics.service");

// Get heatmap coordinates and intensities
exports.getHeatmap = async (req, res, next) => {
  try {
    const data = await analyticsService.getHeatmapData();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// Get distress frequency by boat
exports.getDistressFrequency = async (req, res, next) => {
  try {
    const data = await analyticsService.getDistressFrequency();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// Get rescue mission summary statistics
exports.getRescueStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getRescueStats();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};
