import express from "express";
import cookieParser from "cookie-parser";

/**
 * replaced these...
 * import dotenv from "dotenv";
 * dotenv.config();
 *
 * loads and runs dotenv/config - dotenv automatically calls config()
 * variables from .env still available through process.env
 */
import "dotenv/config";
import cors from "cors";

// database configuration
import connectDB from "./config/db.js";

// wire MQTT, check-device-active, update-device-offline into index
import "./services/mqttService.js";
import "./services/heartbeatListener.js";
import startOfflineChecker from "./services/offlineChecker.js";

// wiring routes
import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import manifestRoutes from "./routes/manifestRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";

// file upload
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express(); // creates express application

// gets the PORT from .env or fallback keeps server runnable without a .env file
const PORT = process.env.PORT || 3000;

// adds middleware that runs on every incoming request
app.use(express.json());

// middleware: runs on every incoming req - adds special HTTP res headers (Access-Control-Allow-Origin)
// app.use(cors());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

// mounts your router at the /<route> path prefix.
app.use("/auth", authRoutes);
app.use("/content", contentRoutes);
app.use("/devices", deviceRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/manifest", manifestRoutes);
app.use("/playlists", playlistRoutes);
app.use("/upload", uploadRoutes);

// create /health - when somebody sends a GET req to /health - they receive { status: "ok" }
// req from client and res sent from server
app.get("/health", (req, res) => {
  res.json({ status: "ok" }); // sends JSON data
});

// server starts with NODEMON (npm i -d nodemon) - automatically starts server - when there is a change
// use this script in package.json - "dev": "nodemon index.js" - npm run dev
connectDB().then(() => {
  // server only starts accepting requests once DB is connected, so no request hits a dead DB
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startOfflineChecker();
});
