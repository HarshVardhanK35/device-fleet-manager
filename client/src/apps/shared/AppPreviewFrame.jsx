import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { PREVIEW_SIZES } from "./previewSizes.js";
import { loadAppBundle, isAppBundleUrl } from "./loadAppBundle.js";
import { API_BASE } from "../../api/apiClient.js";

// The bordered/shadowed preview box every app settings screen shows its
// live preview inside. Handles the sizing (desktop/tablet/mobile), loading
// a built app bundle when `src` is one (fetch+unzip, see loadAppBundle.js)
// vs. loading a dev server URL directly, and a small postMessage handshake
// with whatever app ends up in the iframe either way:
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
function AppPreviewFrame({ size = "desktop", src = "about:blank", config, fullscreen = false }) {
  const [appReady, setAppReady] = useState(false);
  const [appListening, setAppListening] = useState(false);
  const [bundleHtml, setBundleHtml] = useState(null);
  const [bundleError, setBundleError] = useState(null);
  const iframeRef = useRef(null);

  const isBundle = isAppBundleUrl(src);

  // A bundle URL (a built .zip) has nothing to show until it's actually
  // fetched and unzipped — a dev URL (a live server, e.g. localhost:5174)
  // skips all of this and loads straight via the iframe's `src` below.
  //
  // Doesn't reset bundleHtml/bundleError on `src` changing — every current
  // caller renders one AppPreviewFrame per fixed, never-changing app URL
  // (e.g. weather-modal.jsx's WEATHER_APP_URL, a module-level constant), so
  // this never actually runs twice with a different `src` on the same
  // mounted instance. A future caller that reuses one instance across
  // different apps should key it by `src` to force a fresh mount instead,
  // same pattern already used elsewhere in this app (e.g. Content.jsx
  // keying WeatherSettingsScreen by open/edit-target) rather than
  // hand-syncing props into state here.
  useEffect(() => {
    if (!isBundle) return;

    let cancelled = false;
    loadAppBundle(src)
      .then((html) => {
        if (!cancelled) setBundleHtml(html);
      })
      .catch(() => {
        if (!cancelled) setBundleError("Couldn't load this app's bundle.");
      });

    return () => {
      cancelled = true;
    };
  }, [src, isBundle]);

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
    // Re-attaches if the iframe itself is swapped out (a new `src`, or a
    // bundle finishing its fetch+unzip and mounting a fresh iframe).
  }, [src, bundleHtml]);

  // Live-update: once the app has confirmed it's listening, push every
  // later config change straight to it — not just the config it got at
  // first handshake.
  useEffect(() => {
    if (!appListening) return;
    // `apiBase` is injected here, not by each app's own settings screen —
    // any app that needs to call DFM's backend (e.g. RSS's feed-fetch
    // proxy) gets it automatically, no per-app wiring needed.
    iframeRef.current?.contentWindow?.postMessage(
      { type: "DFM_CONFIG", config: { ...config, apiBase: API_BASE } },
      "*",
    );
  }, [config, appListening]);

  const { aspect, maxWidth } = PREVIEW_SIZES[size];

  // A bundle has nothing to hand the iframe until it's fetched+unzipped; a
  // dev URL can mount the iframe immediately.
  const canMountIframe = isBundle ? bundleHtml !== null : true;

  return (
    <div
      className={`p-1 sm:p-1.5 bg-bg-panel shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(1,4,9,0.5)] transition-[max-width,height] duration-300 ease-in-out ${
        fullscreen ? "h-full max-w-full" : "w-full"
      }`}
      style={fullscreen ? undefined : { maxWidth }}
    >
      {/* @container lets anything inside use cqw units (sized relative to
          THIS box, not the browser window) — that's how an app's own
          text/icons can stay proportional across desktop/tablet/mobile
          sizes without needing separate layouts for each.
          Fullscreen: sized from HEIGHT (height:100%, width auto via the
          aspect-ratio) instead of width — otherwise a very wide box just
          grows even taller at a fixed aspect ratio and pushes its own
          bottom content (e.g. the RSS ticker strip) below the visible
          area instead of actually fitting on screen. */}
      <div
        className={`@container relative overflow-hidden border border-border-muted mx-auto transition-[width,height,max-width,aspect-ratio] duration-300 ease-in-out ${
          fullscreen ? "h-full w-auto max-w-full" : "w-full"
        }`}
        style={{ aspectRatio: aspect }}
      >
        {canMountIframe && (
          <iframe
            ref={iframeRef}
            title="App preview"
            {...(isBundle ? { srcDoc: bundleHtml } : { src })}
            className={`absolute inset-0 w-full h-full transition-opacity ${
              appReady ? "opacity-100" : "opacity-0"
            }`}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {!appReady && !bundleError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 size={28} className="animate-spin text-text-muted" />
          </div>
        )}
        {bundleError && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-accent-red text-center px-6">
            {bundleError}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppPreviewFrame;
