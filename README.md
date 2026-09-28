# Device Fleet Manager

A MERN stack application for managing a fleet of Android/embedded kiosk devices used for digital signage — push content and playlists to devices, monitor online/offline status, and schedule content by device and time window.

Architecture is inspired by a real digital signage platform (console → engine → device delivery), adapted and simplified for a portfolio-scoped MERN project.

## Services

- **Content Service** — CRUD for content items (playlists/apps), with JSON-schema validation on the config blob.
- **Assignment/Playlist Service** — device ↔ content ↔ schedule associations (which devices, what time window).
- **Manifest Composer** — builds one canonical JSON "device manifest" per device.
- **Delivery Layer** — MQTT push to devices.
- **Device Simulator** — a browser/headless client that authenticates, receives manifests, and reports heartbeat/status (stands in for real hardware).
- **Fleet Dashboard** — React UI showing online/offline status, last-seen, and current content per device.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React
- **Realtime/Delivery:** MQTT

## Prerequisites

- Node.js (v18+ recommended)
- npm
- A MongoDB connection string (e.g. MongoDB Atlas)
- An MQTT broker running locally (e.g. [Mosquitto](https://mosquitto.org/), default port `1883`)

## Installation

Clone the repository:

```bash
git clone <repo-url>
cd device-fleet-manager
```

### Server setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/` with:

```
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
```

Run the server in development mode:

```bash
npm run dev
```

### Running the Device Simulator

With the server running and connected to your MQTT broker, simulate a device receiving content and reporting status:

```bash
cd server
node services/deviceSimulator.js
```

This subscribes to a device's manifest topic, logs manifests as they're delivered, and publishes periodic heartbeats so the device's status/last-seen updates in real time.

### Client setup

```bash
cd client
npm install
npm start
```

## Dependencies

**Server**
- `express` — HTTP server and routing
- `mongoose` — MongoDB object modeling
- `dotenv` — environment variable loading
- `mqtt` — MQTT client for publishing device manifests to the broker
- `nodemon` (dev) — auto-restart on file changes

**Client**
- React (see `client/package.json` once scaffolded)
