# Device Fleet Manager

A MERN stack app to manage a fleet of Android/embedded kiosk devices — push content/playlists, monitor online/offline status, and schedule content by location/time.

Architecture is inspired by a real digital signage platform (console → engine → device delivery), adapted and simplified for a portfolio-scoped MERN project.

## Services

- **Content Service** — CRUD for content items (playlists/apps), with JSON-schema validation on the config blob.
- **Assignment/Playlist Service** — device ↔ content ↔ schedule associations (which devices, what time window).
- **Manifest Composer** — builds one canonical JSON "device manifest" per device.
- **Delivery Layer** — Socket.IO (or MQTT) push to devices, HTTP poll as fallback.
- **Device Simulator** — a browser/headless client that authenticates, receives manifests, and reports heartbeat/status (stands in for real hardware).
- **Fleet Dashboard** — React UI showing online/offline status, last-seen, current content per device.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React
- Realtime: Socket.IO
- Deployment: TBD (Render/Railway + Vercel + Atlas)
