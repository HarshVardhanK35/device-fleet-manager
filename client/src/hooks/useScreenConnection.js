import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

import { API_BASE } from "../api/apiClient.js";
import { readManifest, readPlaying, saveManifest } from "../offline/savedManifest.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

// Put in front of every topic ("stg/", "prod/") so two environments can share one
// broker; must match the server's MQTT_TOPIC_PREFIX. Empty by default.
const TOPIC_PREFIX = import.meta.env.VITE_MQTT_TOPIC_PREFIX || "";

const HEARTBEAT_MS = 10000; // matches services/deviceSimulator.js's interval
const CONNECT_TIMEOUT_MS = 10000; // the connect call gives up after this long
const BANNER_EVERY_MS = 60000; // while offline the OFFLINE strip appears once a minute (first one a minute after the drop)
const BANNER_SHOW_MS = 10000; // and stays, pulsing, this long
const BACK_ONLINE_MS = 5000; // the green ONLINE strip when the connection returns, shown once
const RECONNECT_WAIT_MS = 5000; // between tries while the server can't be reached at start
const RELEASE_RETRY_MS = 3000; // between tries when a release is answered "already connected"
const RELEASE_RETRIES = 10; // about 30 s, longer than the server's 20 s "still online" window

// A screen's live link to the server: claims the one-connection slot, listens
// for the manifest and the take-over / release messages over MQTT, sends the
// heartbeat, and tracks whether the server can be reached.
//   returns { manifest, connection, online, offlineLock, bannerOn, refreshTick }
//     connection   connecting | connected | rejected | taken-over
//     online       false while the server can't be reached
//     offlineLock  the assignment the screen may keep playing while offline
//     bannerOn     true for 10 s every minute while the screen is offline
//     backOnline   true for 5 s, once, when the screen reconnects after the
//                  OFFLINE strip had been shown (a short blip shows nothing)
//     refreshTick  goes up when the owner sends "Refresh screen"
// `activeIdRef.current` is the assignment playing right now; `setNow` is told
// the moment a new manifest arrives (see the comment where it is called).
export function useScreenConnection(screenToken, { activeIdRef, setNow }) {
  const [manifest, setManifest] = useState(null);
  const [connection, setConnection] = useState("connecting");
  const [online, setOnline] = useState(true);
  const [offlineLock, setOfflineLock] = useState(null);
  const [bannerOn, setBannerOn] = useState(false);
  const [backOnline, setBackOnline] = useState(false);
  // Set once the OFFLINE strip has actually appeared in this offline spell.
  const stripShownRef = useRef(false);
  // Goes up by one each time the owner sends "Refresh screen".
  const [refreshTick, setRefreshTick] = useState(0);
  const manifestSig = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let mqttClient = null;
    let heartbeatTimer = null;
    let retryTimer = null;
    let backOnlineTimer = null;
    // The real Mongo _id, resolved once from /connect's response. MQTT
    // topics are keyed by this (internal, never exposed to this client
    // beyond this one response) — screenToken (the public, unguessable,
    // revocable identifier) is only ever used for the HTTP connect/
    // disconnect calls themselves. See Player.jsx's trailing comment for
    // the full Phase 3 reasoning.
    let resolvedId = null;

    // The connection to the server is lost: keep playing the playlist that
    // is playing now (or the one saved as playing, after a restart).
    function markOffline() {
      if (cancelled) return;
      setOfflineLock((lock) => lock ?? activeIdRef.current ?? readPlaying(screenToken));
      setOnline(false);
      clearTimeout(backOnlineTimer);
      setBackOnline(false);
    }

    function markOnline() {
      setOnline(true);
      setOfflineLock(null);
      // Back after the OFFLINE strip was shown: say so once, then never again.
      if (stripShownRef.current) {
        stripShownRef.current = false;
        setBackOnline(true);
        clearTimeout(backOnlineTimer);
        backOnlineTimer = setTimeout(() => setBackOnline(false), BACK_ONLINE_MS);
      }
    }

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
        if (!mqttClient?.connected) return;
        mqttClient.publish(
          `${TOPIC_PREFIX}devices/${resolvedId}/heartbeat`,
          JSON.stringify({ status: "online", timestamp: new Date() }),
        );
      }, HEARTBEAT_MS);
    }

    // Claims the one-connection slot (POST /devices/:token/connect).
    // Resolves to { id } on success, { rejected: true } when another tab
    // already holds the slot (or the screen no longer exists), and
    // { unreachable: true } when the server can't be reached (offline,
    // asleep, down, too slow) — used for the initial connect and again
    // after a "reconnect" control message (release) brings a taken-over
    // screen back — see the message handler below.
    async function claimConnection() {
      try {
        const res = await fetchWithTimeout(
          `${API_BASE}/devices/${screenToken}/connect`,
          { method: "POST" },
          CONNECT_TIMEOUT_MS,
        );
        if (res.status === 409 || res.status === 404) return { rejected: true };
        if (!res.ok) return { unreachable: true };
        const data = await res.json();
        return data.deviceId ? { id: data.deviceId } : { rejected: true };
      } catch {
        return { unreachable: true };
      }
    }

    // After a release, claim the slot again. If the server still counts the old
    // connection (a heartbeat in flight when the screen was taken over), wait a
    // few seconds and try again instead of giving up with "connected elsewhere".
    async function reclaimAfterRelease() {
      let result = await claimConnection();
      for (let i = 0; i < RELEASE_RETRIES && result.conflict && !cancelled; i += 1) {
        await new Promise((resolve) => {
          retryTimer = setTimeout(resolve, RELEASE_RETRY_MS);
        });
        if (cancelled) break;
        result = await claimConnection();
      }
      return result;
    }

    window.addEventListener("offline", markOffline);

    (async () => {
      // One active connection per device: claim the slot before doing
      // anything else. A second tab/browser hitting the same screenToken
      // while one is already connected gets rejected here and never
      // subscribes or starts a heartbeat — see future-implementations.md's
      // Preview-tab section for the full reasoning.
      //
      // If the server can't be reached (a power cut, then a router that is
      // not back yet), play the last saved manifest and keep trying.
      let result;
      for (;;) {
        result = await claimConnection();
        if (cancelled) return;
        if (!result.unreachable) break;
        const savedManifest = readManifest(screenToken);
        if (savedManifest) {
          manifestSig.current = manifestSig.current ?? JSON.stringify(savedManifest.playlists);
          setManifest((current) => current ?? savedManifest);
        }
        markOffline();
        await new Promise((resolve) => {
          retryTimer = setTimeout(resolve, RECONNECT_WAIT_MS);
        });
        if (cancelled) return;
      }

      if (result.rejected) {
        setConnection("rejected");
        return;
      }

      resolvedId = result.id;
      setConnection("connected");

      // ws: browser's websocket connection to the broker. Falls back to the
      // local dev broker (no auth) when these aren't set, same pattern as
      // the backend's mqttService.js — deployed builds get the real wss://
      // URL + credentials baked in at build time via Vite env vars, since a
      // static frontend build has no other way to vary this per environment.
      const mqttUrl = import.meta.env.VITE_MQTT_WS_URL || "ws://localhost:9001";
      console.log("Connecting to MQTT broker:", mqttUrl);

      // A short keepalive makes a silently dropped connection show up as
      // "offline" within seconds (the default is a minute).
      mqttClient = mqtt.connect(
        mqttUrl,
        {
          username: import.meta.env.VITE_MQTT_USERNAME,
          password: import.meta.env.VITE_MQTT_PASSWORD,
          keepalive: 10,
          reconnectPeriod: 2000,
        },
      );

      // subscription - to topic devices/<resolvedId>/manifest, plus a
      // control topic the backend's take-over/release actions publish to
      // (POST /devices/:id/take-over | /release -> publishControlMessage).
      mqttClient.on("connect", () => {
        console.log("MQTT connected:", mqttUrl);
        markOnline();
        mqttClient.subscribe(`${TOPIC_PREFIX}devices/${resolvedId}/manifest`);
        mqttClient.subscribe(`${TOPIC_PREFIX}devices/${resolvedId}/control`);
      });
      mqttClient.on("close", markOffline);
      mqttClient.on("offline", markOffline);

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
            // Tell the server at once that this screen is offline. Otherwise it
            // keeps counting it as connected for up to 20 s, and a release in
            // those seconds is refused as "already connected elsewhere".
            fetchWithTimeout(`${API_BASE}/devices/${screenToken}/disconnect`, { method: "POST" }, CONNECT_TIMEOUT_MS).catch(() => {});
          } else if (data.action === "refresh") {
            // "Refresh screen": the playlist starts again from the first item
            // (DevicePlayback watches refreshTick). `now` is refreshed first so the
            // restart is timed from this moment, not from a stale clock.
            setNow(Date.now());
            setRefreshTick((tick) => tick + 1);
          } else if (data.action === "reconnect") {
            reclaimAfterRelease().then((reaccepted) => {
              if (cancelled) return;
              if (!reaccepted.id) {
                setConnection("rejected");
                return;
              }
              resolvedId = reaccepted.id;
              setConnection("connected");
              startHeartbeat();
            });
          }
          return;
        }

        if (cancelled) return;
        // The same manifest again (the broker hands the last one over every
        // time the screen reconnects): keep playing, don't restart.
        const sig = JSON.stringify(data.playlists);
        if (sig === manifestSig.current) return;
        manifestSig.current = sig;
        saveManifest(screenToken, data);
        // Refresh "now" the moment a manifest actually arrives, not just at
        // the next scheduled boundary check — otherwise a reset triggered
        // by this manifest (see the prevAssignment block in
        // DevicePlayback.jsx) backdates itemStartedAt from a stale "now"
        // (up to 60s old), making the rotation effect compute ~0ms remaining
        // on item 0 and instantly skip past it, which looked like playback
        // never restarted at all.
        setNow(Date.now());
        setManifest(data);
      });

      startHeartbeat();
    })();

    // whenever screenToken changes and component unmounts - clean up fn ends the connection
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      clearTimeout(backOnlineTimer);
      window.removeEventListener("offline", markOffline);
      stopHeartbeat();
      if (mqttClient) mqttClient.end();
    };

    // whenever there is a change in "screenToken" - useEffect runs
  }, [screenToken, activeIdRef, setNow]);

  // While the screen is offline the OFFLINE strip appears once a minute (the
  // first one a minute after the drop) and stays, pulsing, for 10 s: at 1:00 to
  // 1:10, 2:00 to 2:10 and so on. It goes away at once when the screen is back.
  useEffect(() => {
    if (online) return undefined;
    let timer;
    function hide() {
      setBannerOn(false);
      timer = setTimeout(show, BANNER_EVERY_MS - BANNER_SHOW_MS);
    }
    function show() {
      stripShownRef.current = true;
      setBannerOn(true);
      timer = setTimeout(hide, BANNER_SHOW_MS);
    }
    timer = setTimeout(show, BANNER_EVERY_MS);
    return () => {
      clearTimeout(timer);
      setBannerOn(false);
    };
  }, [online]);

  return { manifest, connection, online, offlineLock, bannerOn, backOnline, refreshTick };
}

// Used by: components/screens/DevicePlayback.jsx.
