import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { PREVIEW_SIZES } from "./previewSizes.js";

// The bordered/shadowed preview box every app settings screen shows its
// live preview inside. Handles the sizing (desktop/tablet/mobile) and a
// small postMessage handshake with whatever app is loaded in the iframe:
//
//   1. The app sends { type: "APP_READY" } once it's mounted and listening.
//   2. This replies with { type: "DFM_CONFIG", config } — the app's own
//      settings (location, unit, etc.), read from `config` below.
//   3. The app sends { type: "APP_LOAD" } once it's actually rendered
//      something with that config (success or failure both count).
//
// `config` is re-sent automatically whenever it changes AFTER step 1 has
// already happened — that's what makes editing a setting live-update the
// preview without needing to click Save first.
function AppPreviewFrame({ size = "desktop", src = "about:blank", config }) {
  const [appReady, setAppReady] = useState(false);
  const [appListening, setAppListening] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    function handleMessage(e) {
      if (e.source !== iframeRef.current?.contentWindow) return;

      if (e.data?.type === "APP_READY") {
        // Sending the config happens in the effect below (triggered by
        // appListening flipping true) — not here too. Sending it from both
        // places fired two near-simultaneous messages on every handshake,
        // which could race with each other in the app and apply whichever
        // happened to resolve last, not whichever was actually newest.
        setAppListening(true);
      } else if (e.data?.type === "APP_LOAD") {
        setAppReady(true);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // Only re-attaches if the iframe itself is swapped out (a new `src`).
  }, [src]);

  // Live-update: once the app has confirmed it's listening, push every
  // later config change straight to it — not just the config it got at
  // first handshake.
  useEffect(() => {
    if (!appListening) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "DFM_CONFIG", config }, "*");
  }, [config, appListening]);

  const { aspect, maxWidth } = PREVIEW_SIZES[size];

  return (
    <div
      className="w-full p-2 sm:p-3 rounded-xl bg-bg-panel shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(1,4,9,0.5)] transition-[max-width] duration-200"
      style={{ maxWidth }}
    >
      {/* @container lets anything inside use cqw units (sized relative to
          THIS box, not the browser window) — that's how an app's own
          text/icons can stay proportional across desktop/tablet/mobile
          sizes without needing separate layouts for each. */}
      <div
        className="w-full @container relative overflow-hidden rounded-md border border-border-muted"
        style={{ aspectRatio: aspect }}
      >
        <iframe
          ref={iframeRef}
          title="App preview"
          src={src}
          className={`absolute inset-0 w-full h-full transition-opacity ${
            appReady ? "opacity-100" : "opacity-0"
          }`}
          sandbox="allow-scripts allow-same-origin"
        />
        {!appReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 size={28} className="animate-spin text-text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}

export default AppPreviewFrame;
