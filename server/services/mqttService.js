import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("MQTT connected");
});

client.on("error", (err) => {
  console.error(err);
});

export const publishManifestToDevice = (deviceId, manifest) => {
  client.publish(`devices/${deviceId}/manifest`, JSON.stringify(manifest));
};

export default client;
