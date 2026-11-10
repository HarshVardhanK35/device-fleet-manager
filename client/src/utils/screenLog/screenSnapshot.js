import { redact } from "./screenLog.js";

// Everything worth knowing about the browser a screen runs in and the state of its saved
// files, taken at the moment the owner pulls the logs. Each part is wrapped so one thing
// a browser can't answer never stops the rest.

// What the player (DevicePlayback) knows right now: playlist, item, saved files ...
let provider = null;
export function setSnapshotProvider(fn) {
  provider = fn;
}

function safe(fn, fallback = null) {
  try {
    const value = fn();
    return value === undefined ? fallback : value;
  } catch (error) {
    return `unavailable (${error.message})`;
  }
}

// The browser's name and version, and the TV (Tizen / webOS) it runs on, from its user agent.
export function describeBrowser(ua = navigator.userAgent) {
  const find = (pattern) => (pattern.exec(ua) || [])[1] || null;
  const chromium = find(/Chrome\/([\d.]+)/);
  let browser = "Unknown";
  let version = null;
  if (/SamsungBrowser\//.test(ua)) {
    browser = "Samsung Internet";
    version = find(/SamsungBrowser\/([\d.]+)/);
  } else if (/Silk\//.test(ua)) {
    browser = "Amazon Silk";
    version = find(/Silk\/([\d.]+)/);
  } else if (/Edg\//.test(ua)) {
    browser = "Microsoft Edge";
    version = find(/Edg\/([\d.]+)/);
  } else if (/Firefox\//.test(ua)) {
    browser = "Firefox";
    version = find(/Firefox\/([\d.]+)/);
  } else if (chromium) {
    browser = /\bTV\b|SMART-TV|Tizen|Web0S|WebOS/i.test(ua) ? "TV browser (Chromium)" : "Chrome / Chromium";
    version = chromium;
  } else if (/Safari\//.test(ua)) {
    browser = "Safari";
    version = find(/Version\/([\d.]+)/);
  }
  return {
    browser,
    version,
    chromium,
    tizen: find(/Tizen ([\d.]+)/),
    webos: /Web0S|WebOS/i.test(ua) ? find(/Web0S[^;)]*?([\d.]+)\)/i) || "yes" : null,
    smartTv: /SMART-TV|SmartTV|Tizen|Web0S|WebOS|\bTV\b/i.test(ua),
    userAgent: ua,
  };
}

async function storageInfo() {
  const out = {};
  if (navigator.storage?.estimate) {
    const { quota, usage } = await navigator.storage.estimate();
    out.quotaMB = quota ? Math.round(quota / 1048576) : null;
    out.usageMB = usage ? Math.round(usage / 1048576) : null;
    out.freeMB = quota ? Math.round((quota - usage) / 1048576) : null;
  } else {
    out.estimate = "not supported";
  }
  if (navigator.storage?.persisted) out.persisted = await navigator.storage.persisted();
  return out;
}

async function cacheInfo() {
  if (typeof caches === "undefined") return "Cache API not supported";
  const out = {};
  for (const name of await caches.keys()) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    out[name] = {
      files: keys.length,
      list: name === "cw-media-v1" ? keys.map((request) => redact(request.url).slice(0, 160)) : undefined,
    };
  }
  return out;
}

async function serviceWorkerInfo() {
  if (!("serviceWorker" in navigator)) return "not supported in this browser";
  const registrations = await navigator.serviceWorker.getRegistrations();
  return {
    controlsThisPage: !!navigator.serviceWorker.controller,
    controllerState: navigator.serviceWorker.controller?.state || null,
    registrations: registrations.map((r) => ({
      scope: r.scope,
      active: r.active?.state || null,
      waiting: r.waiting?.state || null,
      installing: r.installing?.state || null,
    })),
  };
}

export async function buildSnapshot() {
  const video = document.createElement("video");
  const connection = navigator.connection || {};
  const snapshot = {
    takenAt: new Date().toString(),
    deviceClockISO: new Date().toISOString(),
    timeZone: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
    browser: describeBrowser(),
    page: {
      path: redact(window.location.pathname),
      visibility: document.visibilityState,
      environment: import.meta.env.MODE,
    },
    network: {
      navigatorOnLine: navigator.onLine,
      type: connection.effectiveType || null,
      downlinkMbps: connection.downlink ?? null,
      saveData: connection.saveData ?? null,
    },
    display: {
      screen: `${window.screen.width}x${window.screen.height}`,
      window: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      orientation: safe(() => window.screen.orientation?.type, null),
    },
    hardware: {
      platform: navigator.platform,
      language: navigator.language,
      cpuCores: navigator.hardwareConcurrency ?? null,
      deviceMemoryGB: navigator.deviceMemory ?? null,
    },
    features: {
      serviceWorker: "serviceWorker" in navigator,
      cacheApi: typeof caches !== "undefined",
      indexedDB: typeof indexedDB !== "undefined",
      localStorage: safe(() => !!window.localStorage, false),
      resizeObserver: typeof ResizeObserver !== "undefined",
      abortController: typeof AbortController !== "undefined",
      containerUnits: safe(() => CSS.supports("width", "1cqw"), false),
      aspectRatioCss: safe(() => CSS.supports("aspect-ratio", "1"), false),
      colorMix: safe(() => CSS.supports("color", "color-mix(in srgb, red, blue)"), false),
      subgrid: safe(() => CSS.supports("grid-template-columns", "subgrid"), false),
      playsMp4: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') || "no",
      playsWebm: video.canPlayType('video/webm; codecs="vp9, opus"') || "no",
    },
  };

  const [storage, caches_, worker] = await Promise.all([
    storageInfo().catch((e) => `unavailable (${e.message})`),
    cacheInfo().catch((e) => `unavailable (${e.message})`),
    serviceWorkerInfo().catch((e) => `unavailable (${e.message})`),
  ]);
  snapshot.storage = storage;
  snapshot.savedFiles = caches_;
  snapshot.serviceWorker = worker;

  if (provider) snapshot.player = await Promise.resolve(safe(provider, "unavailable"));
  return snapshot;
}

// Used by: utils/screenLog/screenLogPull.js; DevicePlayback.jsx registers what the player knows.
