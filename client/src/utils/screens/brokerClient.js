import mqtt from "mqtt";

// A short-lived connection to the message broker for the owner's pages (Pull logs, the
// storage status on the Player page). Same address and login the screens use.
export const TOPIC_PREFIX = import.meta.env.VITE_MQTT_TOPIC_PREFIX || "";

export function connectBroker() {
  return mqtt.connect(import.meta.env.VITE_MQTT_WS_URL || "ws://localhost:9001", {
    username: import.meta.env.VITE_MQTT_USERNAME,
    password: import.meta.env.VITE_MQTT_PASSWORD,
    reconnectPeriod: 0,
    connectTimeout: 10000,
  });
}

// Used by: utils/screenLog/screenLogPull.js, hooks/useScreenStorage.js.
