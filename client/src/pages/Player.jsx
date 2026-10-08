import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import mqtt from "mqtt";

function Player() {
  const { deviceId } = useParams();
  const [manifest, setManifest] = useState(null);

  useEffect(() => {
    // ws: browser's websocket connection to 9001
    const client = mqtt.connect("ws://localhost:9001");

    // subscription - to topic devices/<deviceId>/manifest
    client.on("connect", () => {
      client.subscribe(`devices/${deviceId}/manifest`);
    });

    // on subscribing - browser receives a message
    client.on("message", (topic, message) => {
      // message - buffer || message.toString() - converted to JSON || JSON.parse - converts JSON to JS object
      const data = JSON.parse(message.toString());
      setManifest(data);
    });

    // whenever deviceId changes and component unmounts - clean up fn ends the connection
    return () => client.end();

    // whenever there is a change in "deviceId" - useEffect runs
  }, [deviceId]);

  console.log(manifest);
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
