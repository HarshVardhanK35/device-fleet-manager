import { useEffect, useState } from "react";

import { TOPIC_PREFIX, connectBroker } from "../utils/screens/brokerClient.js";

const WAIT_MS = 5000; // the retained message arrives at once, or there is none

// Reads what a screen last reported about its browser and offline storage (a retained
// message, so it also works while the screen is offline: `status.at` says when).
//   returns { status, loading }; status is null when the screen never reported
export function useScreenStorage(screenId, screenStatus) {
  const [result, setResult] = useState({ id: null, status: null });

  useEffect(() => {
    if (!screenId) return undefined;
    let done = false;
    const client = connectBroker();

    function finish(status) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      client.end(true);
      setResult({ id: screenId, status });
    }

    const timer = setTimeout(() => finish(null), WAIT_MS);
    client.on("error", () => finish(null));
    client.on("connect", () => client.subscribe(`${TOPIC_PREFIX}devices/${screenId}/status`, { qos: 1 }));
    client.on("message", (_, message) => {
      try {
        finish(JSON.parse(message.toString()));
      } catch {
        finish(null);
      }
    });

    return () => {
      done = true;
      clearTimeout(timer);
      client.end(true);
    };
  }, [screenId, screenStatus]);

  const loading = !!screenId && result.id !== screenId;
  return { status: result.id === screenId ? result.status : null, loading };
}

// Used by: pages/PlayerSlots.jsx.
