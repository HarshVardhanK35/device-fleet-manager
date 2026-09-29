import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");
const deviceId = process.argv[2];

if (!deviceId) {
  console.error(
    "Please provide a deviceId, e.g. node services/deviceSimulator.js <deviceId>",
  );
  process.exit(1);
}

client.on("connect", () => {
  console.log("simulator connected");
  client.subscribe(`devices/${deviceId}/manifest`);

  setInterval(() => {
    client.publish(
      `devices/${deviceId}/heartbeat`,
      JSON.stringify({ status: "online", timestamp: new Date() }),
    );
  }, 10000);
});

client.on("message", (topic, message) => {
  const manifest = JSON.parse(message.toString());
  console.log(manifest);
});
