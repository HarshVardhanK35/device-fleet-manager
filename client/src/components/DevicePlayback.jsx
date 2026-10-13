import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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

function DevicePlayback(
  {
    screenToken,
    rejectedView,
    waitingView,
    nothingScheduledView,
    takenOverView,
    initialPosition,
  },
  ref,
) {
  const [manifest, setManifest] = useState(null);
  const [connection, setConnection] = useState("connecting"); // connecting|connected|rejected|taken-over
  const [now, setNow] = useState(() => Date.now());
  const [contentIndex, setContentIndex] = useState(0);
  const videoRef = useRef(null);
  // Consumed once, right after the initial content index is derived from it
  // below — a later prop change (e.g. parent re-render) must not re-seek an
  // already-playing video. State (not a ref) because it's set during
  // render, alongside contentIndex, in the block below.
  const [initialPositionApplied, setInitialPositionApplied] = useState(false);
  const [pendingVideoSeek, setPendingVideoSeek] = useState(null);
  // When the current item started, in epoch ms — backdated on resume by
  // however much of it had already played, so the rotation effect below
  // schedules only the *remaining* time instead of the item's full
  // duration. Reset to "now" on every normal advance.
  const [itemStartedAt, setItemStartedAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    let mqttClient = null;
    let heartbeatTimer = null;
    // The real Mongo _id, resolved once from /connect's response. MQTT
    // topics are keyed by this (internal, never exposed to this client
    // beyond this one response) — screenToken (the public, unguessable,
    // revocable identifier) is only ever used for the HTTP connect/
    // disconnect calls themselves. See Player.jsx's trailing comment for
    // the full Phase 3 reasoning.
    let resolvedId = null;

    function stopHeartbeat() {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    }

    function startHeartbeat() {
      stopHeartbeat();
      // Heartbeat keeps the device "online" (see server/services/
      // heartbeatListener.js + offlineChecker.js).
      heartbeatTimer = setInterval(() => {
        mqttClient.publish(
          `devices/${resolvedId}/heartbeat`,
          JSON.stringify({ status: "online", timestamp: new Date() }),
        );
      }, HEARTBEAT_MS);
    }

    // Claims the one-connection slot (POST /devices/:token/connect).
    // Returns the real device _id on success (or null on rejection/
    // failure) — used for the initial connect and again after a
    // "reconnect" control message (release) brings a taken-over screen
    // back — see the message handler below.
    async function claimConnection() {
      try {
        const res = await fetch(`http://localhost:5000/devices/${screenToken}/connect`, {
          method: "POST",
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.deviceId ?? null;
      } catch {
        // Backend unreachable — treat the same as rejected rather than
        // silently connecting with no server-side registration.
        return null;
      }
    }

    (async () => {
      // One active connection per device: claim the slot before doing
      // anything else. A second tab/browser hitting the same screenToken
      // while one is already connected gets rejected here and never
      // subscribes or starts a heartbeat — see future-implementations.md's
      // Preview-tab section for the full reasoning.
      const realId = await claimConnection();
      if (cancelled) return;

      if (!realId) {
        setConnection("rejected");
        return;
      }

      resolvedId = realId;
      setConnection("connected");

      // ws: browser's websocket connection to the broker. Falls back to the
      // local dev broker (no auth) when these aren't set, same pattern as
      // the backend's mqttService.js — deployed builds get the real wss://
      // URL + credentials baked in at build time via Vite env vars, since a
      // static frontend build has no other way to vary this per environment.
      const mqttUrl = import.meta.env.VITE_MQTT_WS_URL || "ws://localhost:9001";
      console.log("Connecting to MQTT broker:", mqttUrl);

      mqttClient = mqtt.connect(
        mqttUrl,
        {
          username: import.meta.env.VITE_MQTT_USERNAME,
          password: import.meta.env.VITE_MQTT_PASSWORD,
        },
      );

      // subscription - to topic devices/<resolvedId>/manifest, plus a
      // control topic the backend's take-over/release actions publish to
      // (POST /devices/:id/take-over | /release -> publishControlMessage).
      mqttClient.on("connect", () => {
        mqttClient.subscribe(`devices/${resolvedId}/manifest`);
        mqttClient.subscribe(`devices/${resolvedId}/control`);
      });

      // on subscribing - browser receives a message
      mqttClient.on("message", (topic, message) => {
        // message - buffer || message.toString() - converted to JSON || JSON.parse - converts JSON to JS object
        const data = JSON.parse(message.toString());

        if (topic.endsWith("/control")) {
          if (data.action === "disconnect") {
            // Taken over: go idle rather than fully ending the MQTT
            // connection — it stays subscribed to this same control topic
            // so a later "reconnect" (release) can actually reach it.
            // Only the heartbeat stops, so the device correctly ages to
            // "offline" server-side while taken over.
            stopHeartbeat();
            setConnection("taken-over");
          } else if (data.action === "reconnect") {
            claimConnection().then((reaccepted) => {
              if (cancelled) return;
              if (!reaccepted) {
                setConnection("rejected");
                return;
              }
              resolvedId = reaccepted;
              setConnection("connected");
              startHeartbeat();
            });
          }
          return;
        }

        if (cancelled) return;
        // Refresh "now" the moment a manifest actually arrives, not just at
        // the next scheduled boundary check — otherwise a reset triggered
        // by this manifest (see the prevAssignment block below) backdates
        // itemStartedAt from a stale "now" (up to 60s old), making the
        // rotation effect compute ~0ms remaining on item 0 and instantly
        // skip past it, which looked like playback never restarted at all.
        setNow(Date.now());
        setManifest(data);
      });

      startHeartbeat();
    })();

    // whenever screenToken changes and component unmounts - clean up fn ends the connection
    return () => {
      cancelled = true;
      stopHeartbeat();
      if (mqttClient) mqttClient.end();
    };

    // whenever there is a change in "screenToken" - useEffect runs
  }, [screenToken]);

  const activeAssignment = findActiveAssignment(manifest, now);

  useImperativeHandle(ref, () => ({
    getPosition() {
      return {
        assignmentId: activeAssignment?.assignmentId ?? null,
        contentIndex,
        elapsedMs: Date.now() - itemStartedAt,
        videoTime: videoRef.current?.currentTime || 0,
      };
    },
  }));

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
    // A saved position only applies to the assignment it was captured
    // from — if the schedule has since moved on to a different assignment,
    // always start that one fresh at item 0.
    const canResume =
      !initialPositionApplied &&
      initialPosition &&
      activeAssignment?.assignmentId &&
      initialPosition.assignmentId === activeAssignment.assignmentId;
    setInitialPositionApplied(true);
    setPendingVideoSeek(canResume ? initialPosition.videoTime || 0 : null);
    setContentIndex(canResume ? initialPosition.contentIndex : 0);
    setItemStartedAt(canResume ? now - (initialPosition.elapsedMs || 0) : now);
  }

  // Rotates through the active playlist's content, each item for its own
  // durationInMillis, looping back to the start. Schedules only the time
  // *remaining* in the current item (duration minus however long it's
  // already been showing since itemStartedAt) rather than always the full
  // duration — this is what makes resuming mid-item actually pick up where
  // it left off instead of replaying the whole item from scratch.
  useEffect(() => {
    const items = activeAssignment?.content;
    const current = items?.[contentIndex];
    if (!current) return;
    const duration = current.durationInMillis > 0 ? current.durationInMillis : FALLBACK_ITEM_MS;
    const remaining = Math.max(duration - (Date.now() - itemStartedAt), 0);
    const t = setTimeout(() => {
      setContentIndex((i) => (i + 1) % items.length);
      setItemStartedAt(Date.now());
    }, remaining);
    return () => clearTimeout(t);
  }, [activeAssignment, contentIndex, itemStartedAt]);

  if (connection === "rejected") {
    return rejectedView ?? <h1>This screen is already connected elsewhere.</h1>;
  }

  if (connection === "taken-over") {
    return takenOverView ?? <h1>This screen was taken over from the app.</h1>;
  }

  // console.log("manifest from screen", manifest);
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
          ref={videoRef}
          src={currentContent.mediaUrl}
          autoPlay
          loop
          muted
          onLoadedMetadata={(e) => {
            if (pendingVideoSeek != null) {
              e.currentTarget.currentTime = pendingVideoSeek;
              setPendingVideoSeek(null);
            }
          }}
          style={{ maxWidth: "100%", maxHeight: "100vh" }}
        />
      )}
      {currentContent.type === "app" && <h1>{currentContent.name}</h1>}
    </>
  );
}

export default forwardRef(DevicePlayback);

// The real device-facing playback logic: claims the one-connection slot
// (POST /devices/:token/connect, keyed by Device.accessToken — a long
// random public token, not the real Mongo _id, see Player.jsx's trailing
// comment for the Phase 3 reasoning), subscribes to the real device's
// devices/<_id>/manifest over MQTT-over-WebSocket (the real _id is
// resolved once from /connect's response and used only for MQTT topics —
// screenToken is never used there), publishes a heartbeat every 10s while
// connected, and renders whatever's actually scheduled right now.
// Schedule-aware: picks the assignment whose beginDT/endDT window covers
// the current time (not just the first one in the manifest), re-checked
// right at the next relevant boundary so it transitions between back-to-
// back assignments on its own — and rotates through that assignment's
// playlist content by each item's durationInMillis, looping. Shows
// `nothingScheduledView` when no assignment currently covers "now".
// Also subscribes to devices/<deviceId>/control, for the take-over/release
// actions (PlayerSlots.jsx -> POST /devices/:id/take-over|release ->
// publishControlMessage). "disconnect" goes idle (heartbeat stops, MQTT
// connection stays up) rather than ending the connection outright — it
// has to stay subscribed to this same topic to ever hear a later
// "reconnect", which re-claims the connection slot and resumes normally.
// Ending the connection on take-over would make release impossible to
// deliver to an already-disconnected client.
// `rejectedView`/`waitingView`/`nothingScheduledView`/`takenOverView` let a
// caller override the default messages to match its own page's visual
// language — all optional.
// Used by: pages/Player.jsx (route "/player/:token"), pages/Screens.jsx
// (the "playing" phase, after pairing + the tap-to-start gesture).
//
// Resume support: forwards a ref exposing getPosition() -> { assignmentId,
// contentIndex, elapsedMs, videoTime }, read by a caller right before
// unmounting this component (e.g. Screens.jsx's long-press stop handler)
// so it can be captured and later passed back in as the `initialPosition`
// prop. On mount, `initialPosition` is only honored if its assignmentId
// still matches whatever's actually active now — if the schedule moved on
// to a different assignment in the meantime, playback always starts that
// one fresh at item 0 instead. `elapsedMs` (how long the saved item had
// already been showing) backdates `itemStartedAt` on resume, so the
// rotation effect schedules only the item's *remaining* time instead of
// its full duration — this is what makes a resumed image/video actually
// pick up mid-item instead of replaying from its own start. `videoTime`
// additionally seeks the actual `<video>` element to the right frame.
