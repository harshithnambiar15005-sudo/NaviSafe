const { body, param, validationResult } = require("express-validator");

// Helper to handle validation errors from express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map((err) => err.msg).join(", ");
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errorMsgs}`,
    });
  }
  next();
};

const validateBoatCreate = [
  body("boatId")
    .notEmpty()
    .withMessage("boatId is required")
    .isString()
    .withMessage("boatId must be a string"),
  body("ownerName")
    .notEmpty()
    .withMessage("ownerName is required")
    .isString()
    .withMessage("ownerName must be a string"),
  body("registrationNumber")
    .notEmpty()
    .withMessage("registrationNumber is required")
    .isString()
    .withMessage("registrationNumber must be a string"),
  validate,
];

const validateBoatUpdate = [
  param("id").isUUID().withMessage("Invalid Boat ID format"),
  body("status")
    .optional()
    .isIn(["SAFE", "DISTRESS", "RESCUED", "OFFLINE", "LOW_SIGNAL"])
    .withMessage("Invalid status value"),
  body("lastLatitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("lastLongitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("signalStrength")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Signal strength must be an integer between 0 and 100"),
  body("batteryLevel")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Battery level must be an integer between 0 and 100"),
  validate,
];

const validateDistressCreate = [
  body("boatId").notEmpty().withMessage("boatId is required"),
  body("lat")
    .notEmpty()
    .withMessage("lat (latitude) is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid float between -90 and 90"),
  body("lng")
    .notEmpty()
    .withMessage("lng (longitude) is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid float between -180 and 180"),
  body("message")
    .notEmpty()
    .withMessage("message is required")
    .isString()
    .withMessage("message must be a string"),
  validate,
];

const validateRescueCreate = [
  body("distressBoatId").notEmpty().withMessage("distressBoatId is required"),
  body("rescueBoatId").notEmpty().withMessage("rescueBoatId is required"),
  validate,
];

const validateRescueUpdate = [
  param("id").isUUID().withMessage("Invalid Rescue Mission ID format"),
  body("status")
    .notEmpty()
    .withMessage("status is required")
    .isIn(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED"])
    .withMessage("Invalid status value"),
  validate,
];

module.exports = {
  validateBoatCreate,
  validateBoatUpdate,
  validateDistressCreate,
  validateRescueCreate,
  validateRescueUpdate,
};
