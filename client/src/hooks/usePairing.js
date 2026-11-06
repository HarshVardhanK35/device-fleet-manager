import { useState, useEffect } from "react";

import { generatePairingCode, getPairingStatus } from "../api/pairing.js";
import { checkDeviceExists } from "../api/devices.js";
import { forgetScreen } from "../offline/forgetScreen.js";
import {
  clearStoredPairing,
  readRetryAt,
  readStoredPairing,
  storePairing,
  storeRetryAt,
} from "../utils/screenStorage.js";

export const CODE_SECONDS = 15 * 60;
const STATUS_POLL_MS = 2000;

// The pairing side of the /screens page: which phase the page is in, the code
// and its countdown, the screen's name and token, and the "too many codes"
// wait. The page itself owns playback (start, stop, continue, unpair).
//   phase   loading | code | paired | tap | playing | stopped
//   limited true while the server refuses new codes (20 per hour per
//           connection); `retryLeft` is the seconds until it gives one again
export function usePairing() {
  const [phase, setPhase] = useState("loading");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(CODE_SECONDS);
  const [screenName, setScreenName] = useState("");
  const [screenToken, setScreenToken] = useState(null);
  // When the server will give codes again (ms), while it refuses them; null otherwise.
  const [retryAt, setRetryAt] = useState(null);
  const limited = retryAt !== null;
  const [retryLeft, setRetryLeft] = useState(0); // seconds until retryAt, for the counter

  function startLimit(until) {
    setRetryAt(until);
    setRetryLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
  }

  // First checks whether this browser already remembers a pairing — if
  // so, confirms it still exists server-side (it may have been removed
  // from the account) and skips straight to reconnecting as that same
  // screen, no new code needed. Otherwise generates a fresh code, same as
  // before. Retries on failure (network hiccup, rate limit, etc.) rather
  // than getting stuck — the TV has no one to show an error to, so it
  // just keeps trying.
  useEffect(() => {
    if (phase !== "loading") return;
    let cancelled = false;

    async function attempt() {
      if (cancelled) return;
      const stored = readStoredPairing();
      if (stored) {
        try {
          const check = await checkDeviceExists(stored.screenToken);
          if (cancelled) return;
          if (check?.exists) {
            setScreenToken(stored.screenToken);
            // The name may have been changed in the app since this screen paired.
            const currentName = check.name || stored.screenName || "";
            setScreenName(currentName);
            if (currentName !== stored.screenName) storePairing({ ...stored, screenName: currentName });
            setPhase("tap");
            return;
          }
          // Confirmed gone (removed from the account) — fall through to
          // a fresh pairing below instead of retrying this screen.
          clearStoredPairing();
          forgetScreen(stored.screenToken);
        } catch {
          // The server can't be reached (no internet): this screen still knows
          // who it is, so go on to "tap to start"; playback then runs from the
          // files and manifest saved earlier (see DevicePlayback.jsx).
          if (cancelled) return;
          setScreenToken(stored.screenToken);
          setScreenName(stored.screenName || "");
          setPhase("tap");
          return;
        }
      }

      // Refused earlier: don't ask again (not even after a reload) until the
      // time the server gave, then try once.
      const blockedUntil = readRetryAt();
      if (blockedUntil) {
        startLimit(blockedUntil);
        setTimeout(attempt, blockedUntil - Date.now() + 1000);
        return;
      }

      try {
        const data = await generatePairingCode();
        if (cancelled) return;
        if (data?.rateLimited) {
          const until = data.retryAt ? new Date(data.retryAt).getTime() : Date.now() + 60 * 60 * 1000;
          storeRetryAt(until);
          startLimit(until);
          setTimeout(attempt, until - Date.now() + 1000);
          return;
        }
        if (!data?.code) throw new Error(data?.message || "generate failed");
        setRetryAt(null);
        setCode(data.code);
        const remaining = Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 1000);
        setSecondsLeft(Math.max(0, remaining));
        setPhase("code");
      } catch {
        if (!cancelled) setTimeout(attempt, 3000);
      }
    }

    attempt();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Counts down to the moment the server gives codes again (shown as mm:ss).
  useEffect(() => {
    if (retryAt === null) return undefined;
    const t = setInterval(() => setRetryLeft(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [retryAt]);

  // Ticks the countdown down to 0, then goes back through "loading" —
  // the countdown hitting zero IS the refresh, automatic, no manual
  // action — which re-triggers the generate effect above for a fresh code.
  useEffect(() => {
    if (phase !== "code") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase("loading");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Polls the real backend for the phone-side pairing confirmation —
  // this is what actually detects a real "Pair screen" submit from
  // PlayerSlots.jsx, no more click-to-simulate.
  useEffect(() => {
    if (phase !== "code" || !code) return;
    let cancelled = false;
    const t = setInterval(async () => {
      try {
        const data = await getPairingStatus(code);
        if (cancelled || data?.status !== "claimed") return;
        setScreenName(data.screenName || "");
        setScreenToken(data.screenToken || null);
        if (data.screenToken) {
          storePairing({ screenToken: data.screenToken, screenName: data.screenName || "" });
        }
        setPhase("paired");
      } catch {
        // Network hiccup — just try again on the next tick.
      }
    }, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [phase, code]);

  useEffect(() => {
    if (phase !== "paired") return;
    const t = setTimeout(() => setPhase("tap"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  return {
    phase,
    setPhase,
    code,
    secondsLeft,
    screenName,
    setScreenName,
    screenToken,
    setScreenToken,
    limited,
    retryLeft,
  };
}

// Used by: pages/Screens.jsx.
