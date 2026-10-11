import { useState, useEffect } from "react";
import mqtt from "mqtt";

const HEARTBEAT_MS = 10000; // matches services/deviceSimulator.js's interval
const FALLBACK_ITEM_MS = 8000; // used only if a content item has no/invalid durationInMillis

function findActiveAssignment(manifest, nowMs) {
  return (
    (manifest?.playlists || []).find((p) => {
      const begin = new Date(p.beginDT).getTime();
      const end = new Date(p.endDT).getTime();
      return nowMs >= begin && nowMs <= end;
    }) || null
  );
}

function DevicePlayback({
  deviceId,
  rejectedView,
  waitingView,
  nothingScheduledView,
  takenOverView,
}) {
  const [manifest, setManifest] = useState(null);
  const [connection, setConnection] = useState("connecting"); // connecting|connected|rejected|taken-over
  const [now, setNow] = useState(() => Date.now());
  const [contentIndex, setContentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let mqttClient = null;
    let heartbeatTimer = null;

    (async () => {
      // One active connection per device: claim the slot before doing
      // anything else. A second tab/browser hitting the same deviceId
      // while one is already connected gets rejected here and never
      // subscribes or starts a heartbeat — see future-implementations.md's
      // Preview-tab section for the full reasoning.
      let accepted;
      try {
        const res = await fetch(`http://localhost:5000/devices/${deviceId}/connect`, {
          method: "POST",
        });
        accepted = res.ok;
      } catch {
        // Backend unreachable — treat the same as rejected rather than
        // silently connecting with no server-side registration.
        accepted = false;
      }

      if (cancelled) return;

      if (!accepted) {
        setConnection("rejected");
        return;
      }

      setConnection("connected");

      // ws: browser's websocket connection to 9001
      mqttClient = mqtt.connect("ws://localhost:9001");

      // subscription - to topic devices/<deviceId>/manifest, plus a control
      // topic the backend's "take over" action publishes to (POST
      // /devices/:id/take-over -> publishControlMessage) to force this
      // connection to drop.
      mqttClient.on("connect", () => {
        mqttClient.subscribe(`devices/${deviceId}/manifest`);
        mqttClient.subscribe(`devices/${deviceId}/control`);
      });

      // on subscribing - browser receives a message
      mqttClient.on("message", (topic, message) => {
        // message - buffer || message.toString() - converted to JSON || JSON.parse - converts JSON to JS object
        const data = JSON.parse(message.toString());

        if (topic.endsWith("/control")) {
          if (data.action === "disconnect") {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            mqttClient.end();
            setConnection("taken-over");
          }
          return;
        }

        setManifest(data);
      });

      // Heartbeat keeps the device "online" (see server/services/
      // heartbeatListener.js + offlineChecker.js).
      heartbeatTimer = setInterval(() => {
        mqttClient.publish(
          `devices/${deviceId}/heartbeat`,
          JSON.stringify({ status: "online", timestamp: new Date() }),
        );
      }, HEARTBEAT_MS);
    })();

    // whenever deviceId changes and component unmounts - clean up fn ends the connection
    return () => {
      cancelled = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (mqttClient) mqttClient.end();
    };

    // whenever there is a change in "deviceId" - useEffect runs
  }, [deviceId]);

  const activeAssignment = findActiveAssignment(manifest, now);

  // Re-checks "what's active now" right at the next meaningful boundary —
  // the current assignment ending, or the next one beginning — instead of
  // a flat polling interval. The manifest already lists every assignment's
  // time window, so this needs no new server push to transition seamlessly
  // between back-to-back assignments (the "seamless cut" decision from
  // future-implementations.md's Preview-tab section).
  useEffect(() => {
    if (!manifest) return;
    const nowMs = Date.now();
    let nextBoundary = null;
    for (const p of manifest.playlists || []) {
      const begin = new Date(p.beginDT).getTime();
      const end = new Date(p.endDT).getTime();
      if (begin > nowMs && (nextBoundary === null || begin < nextBoundary)) nextBoundary = begin;
      if (end > nowMs && (nextBoundary === null || end < nextBoundary)) nextBoundary = end;
    }
    // Clamped: at least 1s out (avoid a tight re-render loop), at most 60s
    // (a safety-net re-check even with no upcoming boundary at all).
    const delay = nextBoundary ? Math.min(Math.max(nextBoundary - nowMs, 1000), 60000) : 30000;
    const t = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(t);
  }, [manifest, now]);

  // Reset to the first item whenever the active assignment itself changes
  // (a different playlist just became active). Adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern)
  // rather than in an effect, so it takes effect in the same render
  // instead of causing an extra one.
  const [prevAssignment, setPrevAssignment] = useState(activeAssignment);
  if (prevAssignment !== activeAssignment) {
    setPrevAssignment(activeAssignment);
    if (contentIndex !== 0) setContentIndex(0);
  }

  // Rotates through the active playlist's content, each item for its own
  // durationInMillis, looping back to the start.
  useEffect(() => {
    const items = activeAssignment?.content;
    const current = items?.[contentIndex];
    if (!current) return;
    const duration = current.durationInMillis > 0 ? current.durationInMillis : FALLBACK_ITEM_MS;
    const t = setTimeout(() => {
      setContentIndex((i) => (i + 1) % items.length);
    }, duration);
    return () => clearTimeout(t);
  }, [activeAssignment, contentIndex]);

  if (connection === "rejected") {
    return rejectedView ?? <h1>This screen is already connected elsewhere.</h1>;
  }

  if (connection === "taken-over") {
    return takenOverView ?? <h1>This screen was taken over from the app.</h1>;
  }

  console.log("manifest from screen", manifest);
  if (!manifest) return waitingView ?? <p>Waiting for manifest...</p>;

  const currentContent = activeAssignment?.content?.[contentIndex];

  if (!currentContent) {
    return nothingScheduledView ?? <h1>Nothing scheduled at this time</h1>;
  }

  return (
    <>
      {currentContent.type === "image" && (
        <img
          src={currentContent.mediaUrl}
          alt={currentContent.name}
          style={{ maxWidth: "100%", maxHeight: "100vh" }}
        />
      )}
      {currentContent.type === "video" && (
        <video
          key={currentContent._id}
          src={currentContent.mediaUrl}
          autoPlay
          loop
          muted
          style={{ maxWidth: "100%", maxHeight: "100vh" }}
        />
      )}
      {currentContent.type === "app" && <h1>{currentContent.name}</h1>}
    </>
  );
}

export default DevicePlayback;

// The real device-facing playback logic: claims the one-connection slot
// (POST /devices/:id/connect), subscribes to devices/<deviceId>/manifest
// over MQTT-over-WebSocket, publishes a heartbeat every 10s while
// connected, and renders whatever's actually scheduled right now.
// Schedule-aware: picks the assignment whose beginDT/endDT window covers
// the current time (not just the first one in the manifest), re-checked
// right at the next relevant boundary so it transitions between back-to-
// back assignments on its own — and rotates through that assignment's
// playlist content by each item's durationInMillis, looping. Shows
// `nothingScheduledView` when no assignment currently covers "now".
// Also subscribes to devices/<deviceId>/control — the "take over" action
// (PlayerSlots.jsx -> POST /devices/:id/take-over -> publishControlMessage)
// publishes { action: "disconnect" } there, which ends this connection and
// switches to the taken-over state rather than trying to reconnect.
// `rejectedView`/`waitingView`/`nothingScheduledView`/`takenOverView` let a
// caller override the default messages to match its own page's visual
// language — all optional.
// Used by: pages/Player.jsx (route "/player/:deviceId"), pages/Screens.jsx
// (the "playing" phase, after pairing + the tap-to-start gesture).
