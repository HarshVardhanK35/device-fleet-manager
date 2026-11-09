import { useEffect, useRef, useState } from "react";

import { resolveAppUrlByName } from "../../resolveAppUrl.js";
import { loadAppBundle, isAppBundleUrl } from "./loadAppBundle.js";
import { API_BASE } from "../../../api/apiClient.js";
import BrandLoader from "../../../components/loading/BrandLoader.jsx";

// Full-screen renderer for a `type: "app"` content item at real playback
// time (DevicePlayback.jsx) — same bundle-loading + postMessage handshake
// as AppPreviewFrame.jsx (the settings-screen preview), minus the
// preview-size toggle and live-edit re-send: a playing screen has no
// editor pushing config changes mid-session, configBlob is whatever was
// saved, sent once.
//   active  false while the app waits behind the one on screen: it loads, compiles and
//           says it is ready, but its settings are held back (so it has not started)
//           and it is not drawn. true when its turn comes: the settings are sent and it
//           appears.
function AppRenderer({ configBlob, active = true }) {
  const [bundleHtml, setBundleHtml] = useState(null);
  const [bundleError, setBundleError] = useState(null);
  const [appListening, setAppListening] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const iframeRef = useRef(null);

  const src = resolveAppUrlByName(configBlob?.appType);
  const isBundle = isAppBundleUrl(src);

  useEffect(() => {
    if (!isBundle) return;

    let cancelled = false;
    loadAppBundle(src, { remember: true })
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
      if (e.data?.type === "APP_LOAD") setAppLoaded(true);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [src, bundleHtml]);

  useEffect(() => {
    if (!appListening || !active) return;
    // `apiBase` injected here too — same reasoning as AppPreviewFrame.jsx's
    // own copy of this: any app needing to call DFM's backend gets it
    // automatically, real playback included, not just the settings preview.
    iframeRef.current?.contentWindow?.postMessage(
      { type: "DFM_CONFIG", config: { ...configBlob, apiBase: API_BASE } },
      "*",
    );
  }, [appListening, active, configBlob]);

  // The logo only appears if the app is still loading after a moment, so a
  // quick start never flashes it on the screen.
  // (Counted only while the app is the one on screen.)
  useEffect(() => {
    if (appLoaded || !active) return undefined;
    const t = setTimeout(() => setSlow(true), 700);
    return () => clearTimeout(t);
  }, [appLoaded, active]);

  const loader =
    active && !appLoaded && slow ? (
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <BrandLoader size={72} label="Loading app" />
      </div>
    ) : null;

  if (bundleError) {
    return <h1>{bundleError}</h1>;
  }

  const canMountIframe = isBundle ? bundleHtml !== null : true;
  if (!canMountIframe) return loader;

  return (
    <>
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
      style={
        active
          ? { border: "none", width: "100vw", height: "100vh", pointerEvents: "none" }
          : { border: "none", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", visibility: "hidden", pointerEvents: "none" }
      }
      sandbox="allow-scripts allow-same-origin"
    />
    {loader}
    </>
  );
}

export default AppRenderer;
