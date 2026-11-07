import mqtt from "mqtt";

console.log(
  "Connecting to MQTT broker:",
  process.env.MQTT_URL || "mqtt://localhost:1883",
);

const client = mqtt.connect(process.env.MQTT_URL || "mqtt://localhost:1883", {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.on("connect", () => {
  console.log("MQTT connected");
});

client.on("error", (err) => {
  console.error(err);
});

// Put in front of every topic ("stg/", "prod/") so two environments can share
// one broker without hearing each other. Empty by default (local development).
export const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || "";

export const publishManifestToDevice = (deviceId, manifest) => {
  client.publish(`${TOPIC_PREFIX}devices/${deviceId}/manifest`, JSON.stringify(manifest), {
    retain: true,
  });
};

export const publishControlMessage = (deviceId, payload) => {
  client.publish(`${TOPIC_PREFIX}devices/${deviceId}/control`, JSON.stringify(payload));
};

export default client;
