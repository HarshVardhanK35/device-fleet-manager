import { useEffect, useRef, useState } from "react";

import { resolveAppUrlByName } from "../resolveAppUrl.js";
import { loadAppBundle, isAppBundleUrl } from "./loadAppBundle.js";
import { API_BASE } from "../../api/apiClient.js";

// Full-screen renderer for a `type: "app"` content item at real playback
// time (DevicePlayback.jsx) — same bundle-loading + postMessage handshake
// as AppPreviewFrame.jsx (the settings-screen preview), minus the
// preview-size toggle and live-edit re-send: a playing screen has no
// editor pushing config changes mid-session, configBlob is whatever was
// saved, sent once.
function AppRenderer({ configBlob }) {
  const [bundleHtml, setBundleHtml] = useState(null);
  const [bundleError, setBundleError] = useState(null);
  const [appListening, setAppListening] = useState(false);
  const iframeRef = useRef(null);

  const src = resolveAppUrlByName(configBlob?.appType);
  const isBundle = isAppBundleUrl(src);

  useEffect(() => {
    if (!isBundle) return;

    let cancelled = false;
    loadAppBundle(src)
      .then((html) => {
        if (!cancelled) setBundleHtml(html);
      })
      .catch(() => {
        if (!cancelled) setBundleError("Couldn't load this app.");
      });

    return () => {
      cancelled = true;
    };
  }, [src, isBundle]);

  useEffect(() => {
    function handleMessage(e) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === "APP_READY") setAppListening(true);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [src, bundleHtml]);

  useEffect(() => {
    if (!appListening) return;
    // `apiBase` injected here too — same reasoning as AppPreviewFrame.jsx's
    // own copy of this: any app needing to call DFM's backend gets it
    // automatically, real playback included, not just the settings preview.
    iframeRef.current?.contentWindow?.postMessage(
      { type: "DFM_CONFIG", config: { ...configBlob, apiBase: API_BASE } },
      "*",
    );
  }, [appListening, configBlob]);

  if (bundleError) {
    return <h1>{bundleError}</h1>;
  }

  const canMountIframe = isBundle ? bundleHtml !== null : true;
  if (!canMountIframe) return null;

  return (
    <iframe
      ref={iframeRef}
      title="App"
      {...(isBundle ? { srcDoc: bundleHtml } : { src })}
      // Apps are passive signage content, never touch-interactive — and an
      // iframe is a separate document, so a pointerdown inside it would
      // never bubble up to Screens.jsx's long-press-to-exit overlay at all
      // (that's why long-press worked for image/video but not apps).
      // pointerEvents: "none" makes the iframe transparent to pointer
      // events entirely, so they pass straight through to that overlay.
      style={{ border: "none", width: "100vw", height: "100vh", pointerEvents: "none" }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

export default AppRenderer;
