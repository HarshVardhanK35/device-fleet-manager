import Device from "../models/Device.js";
import client, { TOPIC_PREFIX } from "./mqttService.js";

client.on("connect", () => {
  client.subscribe(`${TOPIC_PREFIX}devices/+/heartbeat`);
});

client.on("message", async (topic, message) => {
  if (!topic.startsWith(TOPIC_PREFIX) || !topic.endsWith("/heartbeat")) return;

  const deviceId = topic.slice(TOPIC_PREFIX.length).split("/")[1];

  await Device.findByIdAndUpdate(deviceId, {
    status: "online",
    lastSeenAt: new Date(),
  });
});
