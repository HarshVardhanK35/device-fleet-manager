import { logEvent, logError, readLogText, logSummary } from "./screenLog.js";
import { buildSnapshot } from "./screenSnapshot.js";
import { buildZip } from "./zip.js";
import { TOPIC_PREFIX, connectBroker } from "../screens/brokerClient.js";

// "Pull logs": the owner's page asks a screen for its log over MQTT and gets it back in
// pieces (one MQTT message is limited to about 1 MB), then saves it as a .zip.
//
//   screen side   answerPullLogs()   called when the screen gets { action: "pullLogs" }
//   owner side    pullScreenLogs()   asks, collects the pieces, resolves with the whole log
//                 downloadLogsZip()  turns it into a .zip download

const CHUNK_CHARS = 150000; // up to ~450 KB per message even with accented text
const WAIT_MS = 25000; // the screen has this long to answer

// ---- on the screen ----

// Sends the snapshot and the log to `devices/<id>/logs/<requestId>` in pieces.
export async function answerPullLogs(client, deviceId, requestId) {
  const topic = `${TOPIC_PREFIX}devices/${deviceId}/logs/${requestId}`;
  logEvent("logs", `Pull logs asked for (request ${requestId}); building the answer`, logSummary());
  let payload;
  try {
    const snapshot = await buildSnapshot();
    payload = JSON.stringify({ snapshot, log: readLogText() });
  } catch (error) {
    logError("logs", "Could not build the answer", error.message);
    payload = JSON.stringify({ snapshot: { error: error.message }, log: readLogText() });
  }

  const parts = Math.max(1, Math.ceil(payload.length / CHUNK_CHARS));
  for (let part = 0; part < parts; part += 1) {
    const data = payload.slice(part * CHUNK_CHARS, (part + 1) * CHUNK_CHARS);
    await new Promise((resolve) => {
      client.publish(topic, JSON.stringify({ requestId, part, parts, data }), { qos: 1 }, () => resolve());
    });
  }
  logEvent("logs", `Pull logs answered: ${parts} message(s), ${Math.round(payload.length / 1024)} KB`);
}

// ---- on the owner's page ----

export function pullScreenLogs(deviceId) {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).slice(2, 10);
    const topic = `${TOPIC_PREFIX}devices/${deviceId}/logs/${requestId}`;
    const pieces = [];
    let expected = null;
    let finished = false;

    const client = connectBroker();

    function finish(error, result) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      client.end(true);
      if (error) reject(error);
      else resolve(result);
    }

    const timer = setTimeout(
      () => finish(new Error("The screen didn't answer. Is it online?")),
      WAIT_MS,
    );

    client.on("error", () => finish(new Error("Couldn't reach the message server.")));
    client.on("connect", () => {
      client.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          finish(new Error("Couldn't listen for the answer."));
          return;
        }
        client.publish(
          `${TOPIC_PREFIX}devices/${deviceId}/control`,
          JSON.stringify({ action: "pullLogs", requestId }),
        );
      });
    });

    client.on("message", (_, message) => {
      try {
        const { part, parts, data } = JSON.parse(message.toString());
        pieces[part] = data;
        expected = parts;
        if (pieces.filter((p) => p !== undefined).length === expected) {
          finish(null, JSON.parse(pieces.join("")));
        }
      } catch {
        finish(new Error("The answer from the screen was damaged."));
      }
    });
  });
}

export function downloadLogsZip(result, screenName) {
  const safeName = String(screenName || "screen").replace(/[^A-Za-z0-9_-]+/g, "-").slice(0, 40) || "screen";
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fileName = `castwise-logs-${safeName}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.zip`;

  const zip = buildZip([
    { name: "logs.txt", text: result.log || "(no lines)" },
    { name: "snapshot.json", text: JSON.stringify(result.snapshot, null, 2) },
  ]);
  const url = URL.createObjectURL(zip);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return fileName;
}

// Used by: hooks/useScreenSlots.js (owner side), hooks/useScreenConnection.js (screen side).
