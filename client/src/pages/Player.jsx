import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import mqtt from "mqtt";

const HEARTBEAT_MS = 10000; // matches services/deviceSimulator.js's interval

function Player() {
  const { deviceId } = useParams();
  const [manifest, setManifest] = useState(null);
  const [connection, setConnection] = useState("connecting"); // connecting|connected|rejected

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

      // subscription - to topic devices/<deviceId>/manifest
      mqttClient.on("connect", () => {
        mqttClient.subscribe(`devices/${deviceId}/manifest`);
      });

      // on subscribing - browser receives a message
      mqttClient.on("message", (topic, message) => {
        // message - buffer || message.toString() - converted to JSON || JSON.parse - converts JSON to JS object
        const data = JSON.parse(message.toString());
        setManifest(data);
      });

      // Heartbeat keeps the device "online" (see server/services/
      // heartbeatListener.js + offlineChecker.js) — previously missing
      // entirely on this page, only services/deviceSimulator.js faked one.
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

  if (connection === "rejected") {
    return <h1>This screen is already connected elsewhere.</h1>;
  }

  console.log("manifest from screen", manifest);
  if (!manifest) return <p>Waiting for manifest...</p>;

  const firstContent = manifest.playlists?.[0]?.content?.[0];

  if (!firstContent) return <h1>No content</h1>;
  return (
    <>
      {firstContent.type === "image" && (
        <img
          src={firstContent.mediaUrl}
          alt={firstContent.name}
          style={{ maxWidth: "100%", maxHeight: "100vh" }}
        />
      )}
      {firstContent.type === "video" && (
        <video
          src={firstContent.mediaUrl}
          autoPlay
          loop
          muted
          style={{ maxWidth: "100%", maxHeight: "100vh" }}
        />
      )}
      {firstContent.type === "app" && <h1>{firstContent.name}</h1>}
    </>
  );
}

export default Player;

// nothing repeated
