import express from "express";
import dotenv from "dotenv";

// database configuration
import connectDB from "./config/db.js";

// wire MQTT into index
import "./services/mqttService.js";

// wiring the router
import contentRoutes from "./routes/contentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import manifestRoutes from "./routes/manifestRoutes.js"

dotenv.config(); // loads .env into process.env before anything reads it

const app = express(); // creates express application

// gets the PORT from .env or fallback keeps server runnable without a .env file
const PORT = process.env.PORT || 3000;

// adds middleware that runs on every incoming request
app.use(express.json());
// mounts your router at the /content path prefix.
app.use("/content", contentRoutes);
app.use("/devices", deviceRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/manifest", manifestRoutes);

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
});
