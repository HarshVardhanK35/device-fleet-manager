import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("simulator connected");
  client.subscribe("devices/6ab7fd9924f9b2dd79614601/manifest");

  setInterval(() => {
    client.publish(
      "devices/6ab7fd9924f9b2dd79614601/heartbeat",
      JSON.stringify({ status: "online", timestamp: new Date() }),
    );
  }, 10000);
});

client.on("message", (topic, message) => {
  const manifest = JSON.parse(message.toString());
  console.log(manifest);
});
