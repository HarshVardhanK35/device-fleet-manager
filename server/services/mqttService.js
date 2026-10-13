import mqtt from "mqtt";

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

export const publishManifestToDevice = (deviceId, manifest) => {
  client.publish(`devices/${deviceId}/manifest`, JSON.stringify(manifest), {
    retain: true,
  });
};

export const publishControlMessage = (deviceId, payload) => {
  client.publish(`devices/${deviceId}/control`, JSON.stringify(payload));
};

export default client;
