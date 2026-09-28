import Device from "../models/Device.js";
import client from "./mqttService.js";

client.on("connect", () => {
  client.subscribe("devices/+/heartbeat");
});

client.on("message", async (topic, message) => {
  if (!topic.endsWith("/heartbeat")) return;

  const deviceId = topic.split("/")[1];

  await Device.findByIdAndUpdate(deviceId, {
    status: "online",
    lastSeenAt: new Date(),
  });
});
