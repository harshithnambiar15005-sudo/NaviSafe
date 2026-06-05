const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/error");

const app = express();

// Standard middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request logging (only in development or if not testing)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api", routes);

// Base route for status check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Maritime Distress backend API is healthy and running",
    timestamp: new Date()
  });
});

// 404 Route handler
app.use((req, res, next) => {
  const error = new Error("Endpoint Not Found");
  error.statusCode = 404;
  next(error);
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
