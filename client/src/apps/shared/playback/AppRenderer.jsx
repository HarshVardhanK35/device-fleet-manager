import { useEffect, useMemo, useRef, useState } from "react";

import { resolveAppUrlByName } from "../../resolveAppUrl.js";
import { loadAppBundle, isAppBundleUrl } from "./loadAppBundle.js";
import { API_BASE } from "../../../api/apiClient.js";
import BrandLoader from "../../../components/loading/BrandLoader.jsx";
import { logError, logEvent, logForeign } from "../../../utils/screenLog/screenLog.js";

// Lines an app writes to its own console are passed to the screen's log (tagged
// [app:weather] ...): a small script is put at the top of the app's page that forwards
// console output, uncaught errors and rejected promises to this window.
if (typeof window !== "undefined") {
  window.__cwAppLog = (app, level, text) => logForeign(`app:${app}`, level, text);
}

function logHookScript(appName) {
  const name = JSON.stringify(appName);
  return `<script>(function(){try{var n=${name};var p=window.parent;function s(l,a){try{p.__cwAppLog&&p.__cwAppLog(n,l,Array.prototype.map.call(a,function(x){if(typeof x==='string')return x;if(x&&x.message)return (x.name||'Error')+': '+x.message;try{return JSON.stringify(x)}catch(e){return String(x)}}).join(' '))}catch(e){}}['log','info','warn','error'].forEach(function(m){var o=console[m];console[m]=function(){s(m==='error'?'error':m==='warn'?'warn':'info',arguments);return o.apply(console,arguments)}});window.addEventListener('error',function(e){s('error',['uncaught error: '+e.message+' (line '+e.lineno+')'])});window.addEventListener('unhandledrejection',function(e){s('error',['unhandled promise rejection: '+(e.reason&&e.reason.message||e.reason)])})}catch(e){}})();</script>`;
}

// `function` replacement, so a "$" inside the app's code is never misread.
function withLogHook(html, appName) {
  const hook = logHookScript(appName);
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (head) => head + hook) : hook + html;
}

// Full-screen renderer for a `type: "app"` content item at real playback
// time (DevicePlayback.jsx) — same bundle-loading + postMessage handshake
// as AppPreviewFrame.jsx (the settings-screen preview), minus the
// preview-size toggle and live-edit re-send: a playing screen has no
// editor pushing config changes mid-session, configBlob is whatever was
// saved, sent once.
//   onAssets(urls)  called when the app lists the picture links it shows (APP_ASSETS), to be saved
//           for offline play
//   active  false while the app waits behind the one on screen: it loads, compiles and
//           says it is ready, but its settings are held back (so it has not started)
//           and it is not drawn. true when its turn comes: the settings are sent and it
//           appears.
function AppRenderer({ configBlob, active = true, onFailed, onAssets }) {
  const [bundleHtml, setBundleHtml] = useState(null);
  const [bundleError, setBundleError] = useState(null);
  const [appListening, setAppListening] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const iframeRef = useRef(null);

  const src = resolveAppUrlByName(configBlob?.appType);
  const isBundle = isAppBundleUrl(src);
  const appName = String(configBlob?.appType || "app").replace(/[^a-z0-9_-]/gi, "");
  const hookedHtml = useMemo(() => (bundleHtml ? withLogHook(bundleHtml, appName) : null), [bundleHtml, appName]);
  const startedAt = useRef(0);
  // Tells the player once if the app cannot be loaded at all, so it is skipped.
  const reportedFailure = useRef(false);

  useEffect(() => {
    if (bundleError && onFailed && !reportedFailure.current) {
      reportedFailure.current = true;
      onFailed();
    }
  }, [bundleError, onFailed]);

  useEffect(() => {
    startedAt.current = Date.now();
    logEvent("app", `App "${appName}" is being prepared`);
  }, [appName]);

  useEffect(() => {
    if (!isBundle) return;

    let cancelled = false;
    loadAppBundle(src, { remember: true })
      .then((html) => {
        if (!cancelled) setBundleHtml(html);
      })
      .catch((error) => {
        logError("app", `App "${appName}" could not be loaded: ${error.name}: ${error.message}`);
        if (!cancelled) setBundleError("Couldn't load this app.");
      });

    return () => {
      cancelled = true;
    };
  }, [src, isBundle, appName]);

  useEffect(() => {
    function handleMessage(e) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === "APP_READY") {
        logEvent("app", `App "${appName}" is running and waiting for its settings (${Date.now() - startedAt.current} ms after it was prepared)`);
        setAppListening(true);
      }
      // An app lists the pictures it shows (its feed's images) so the player can save them for offline.
      if (e.data?.type === "APP_ASSETS" && onAssets && Array.isArray(e.data.images)) {
        const images = e.data.images.filter((url) => typeof url === "string" && /^https?:\/\//i.test(url)).slice(0, 20);
        logEvent("app", `App "${appName}" lists ${images.length} picture(s) to keep for offline`);
        if (images.length > 0) onAssets(images);
      }
      if (e.data?.type === "APP_LOAD") {
        logEvent("app", `App "${appName}" finished loading its data and is showing (${Date.now() - startedAt.current} ms after it was prepared)`);
        setAppLoaded(true);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [src, bundleHtml, appName, onAssets]);

  useEffect(() => {
    if (!appListening || !active) return;
    // `apiBase` injected here too — same reasoning as AppPreviewFrame.jsx's
    // own copy of this: any app needing to call DFM's backend gets it
    // automatically, real playback included, not just the settings preview.
    logEvent("app", `Settings sent to app "${appName}"`);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "DFM_CONFIG", config: { ...configBlob, apiBase: API_BASE } },
      "*",
    );
  }, [appListening, active, configBlob, appName]);

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
      {...(isBundle ? { srcDoc: hookedHtml } : { src })}
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
