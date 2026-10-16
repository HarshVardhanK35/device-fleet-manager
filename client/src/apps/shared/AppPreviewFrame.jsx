import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { PREVIEW_SIZES } from "./previewSizes.js";

// The bordered/shadowed preview box every app settings screen shows its
// live preview inside. Handles the sizing (desktop/tablet/mobile), the
// actual (currently empty) iframe, and knowing whether the real app has
// loaded yet.
//
// How "loaded" works: the app running inside the iframe is expected to
// `postMessage({ type: "APP_LOAD" })` to its parent window once it's
// actually rendering (this is separate from Ignition's own init() — that's
// an internal detail of the app, APP_LOAD is just "I'm on screen now").
// Until that arrives, there's genuinely nothing real to show — so we show
// a centered loading spinner and nothing else (no fake/placeholder content).
// `children` (the app's real preview) only renders once appReady is true.
function AppPreviewFrame({ size = "desktop", src = "about:blank", children }) {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === "APP_LOAD") setAppReady(true);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const { aspect, maxWidth } = PREVIEW_SIZES[size];

  return (
    <div
      className="w-full p-2 sm:p-3 rounded-xl bg-bg-panel shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(1,4,9,0.5)] transition-[max-width] duration-200"
      style={{ maxWidth }}
    >
      {/* @container lets anything inside use cqw units (sized relative to
          THIS box, not the browser window) — that's how the weather
          preview's text/icons stay proportional across desktop/tablet/
          mobile sizes without needing separate layouts for each. */}
      <div
        className="w-full @container relative overflow-hidden rounded-md border border-border-muted"
        style={{ aspectRatio: aspect }}
      >
        <iframe
          title="App preview"
          src={src}
          className="absolute inset-0 w-full h-full opacity-0"
          sandbox="allow-scripts allow-same-origin"
        />
        {appReady ? (
          children
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}

export default AppPreviewFrame;
