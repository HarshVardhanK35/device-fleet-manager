import { useCallback, useEffect, useRef, useState } from "react";
import { CloudOff } from "lucide-react";

import ThreeDots from "../loading/ThreeDots.jsx";
import Logo from "../layout/Logo.jsx";
import { API_BASE } from "../../api/apiClient.js";

// How the message changes the longer the server stays away (seconds).
const WAKING_AFTER = 15;
const UNAVAILABLE_AFTER = 60;

// When the server can't be reached. apiClient.js raises `castwise:api-down` on
// a network failure; the browser's own online / offline events count too. The
// longer it lasts, the more it says, and it never sends anyone away:
//   0 to 15 s    a small banner: "Can't reach the server. Retrying"
//   15 to 60 s   the same banner: "The server is taking longer than usual…"
//   after 60 s   a centred card: "CastWise is temporarily unavailable", with
//                a Try again button
// It asks the server's /health every 5 s, then every 15 s, then every 30 s
// (so a long outage isn't hammered) and goes away as soon as it answers.
// Used by: App.jsx.
function ConnectionBanner() {
  const [down, setDown] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const markDown = () => {
      startRef.current = new Date().getTime();
      setDown((was) => was || true);
    };
    const markUp = () => {
      setDown(false);
      setElapsed(0);
    };
    window.addEventListener("castwise:api-down", markDown);
    window.addEventListener("castwise:api-up", markUp);
    window.addEventListener("offline", markDown);
    window.addEventListener("online", markUp);
    return () => {
      window.removeEventListener("castwise:api-down", markDown);
      window.removeEventListener("castwise:api-up", markUp);
      window.removeEventListener("offline", markDown);
      window.removeEventListener("online", markUp);
    };
  }, []);

  // Seconds since it went down, to pick the message.
  useEffect(() => {
    if (!down) return undefined;
    const t = setInterval(() => {
      setElapsed(Math.floor((new Date().getTime() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [down]);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
      if (res.ok) {
        setDown(false);
        setElapsed(0);
        return true;
      }
    } catch {
      /* still unreachable */
    }
    return false;
  }, []);

  // Retry with a growing gap: 5 s, then 15 s, then 30 s.
  useEffect(() => {
    if (!down) return undefined;
    let timer;
    let cancelled = false;
    const tick = async () => {
      if (await checkHealth()) return;
      if (cancelled) return;
      const seconds = (new Date().getTime() - startRef.current) / 1000;
      timer = setTimeout(tick, seconds < WAKING_AFTER ? 5000 : seconds < UNAVAILABLE_AFTER ? 15000 : 30000);
    };
    timer = setTimeout(tick, 5000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [down, checkHealth]);

  async function tryNow() {
    setChecking(true);
    await checkHealth();
    setChecking(false);
  }

  if (!down) return null;

  if (elapsed >= UNAVAILABLE_AFTER) {
    return (
      <div
        role="alertdialog"
        aria-live="polite"
        className="fixed inset-0 z-[90] flex items-center justify-center bg-bg-primary/80 px-5 backdrop-blur-sm"
      >
        <div className="flex w-full max-w-[420px] flex-col items-center gap-5 rounded-xl border border-border-muted bg-bg-panel p-8 text-center">
          <Logo size={44} />
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border-muted bg-bg-primary text-text-muted">
            <CloudOff size={22} />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-xl font-semibold text-text-primary">CastWise is temporarily unavailable</h2>
            <p className="m-0 text-text-muted">
              We couldn't reach the server for a while. We'll keep trying, and you can come back later.
            </p>
          </div>
          <span className="flex items-center gap-2 text-sm text-text-muted">
            Trying again
            <ThreeDots />
          </span>
          <button
            type="button"
            onClick={tryNow}
            disabled={checking}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-accent-blue bg-[#1f6feb] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1a5fd0] disabled:opacity-60"
          >
            {checking ? "Checking…" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="fixed top-3 left-1/2 z-[90] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-full border border-accent-amber/40 bg-bg-panel px-4 py-2 text-sm text-text-primary shadow-lg"
    >
      {elapsed < WAKING_AFTER
        ? "Can't reach the server. Retrying"
        : "The server is taking longer than usual. It may be waking up"}
      <ThreeDots />
    </div>
  );
}

export default ConnectionBanner;
