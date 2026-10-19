import appsRegistry from "./appsRegistry.json";

// idea: dev/staging/prod config split (one per-app URL for each environment) 
// — kept here as one registry with three
// URL fields per app instead of three separate files, so the same appId
// never has to be repeated (and risk drifting) across files.
//
// Which URL wins depends on how THIS COPY of DFM is currently running:
//  `npm run dev` (import.meta.env.DEV) -> devUrl (an app's local
//    `npm run dev` server, e.g. Weather on localhost:5174)
//   a deployed build -> stagingZipUrl or prodZipUrl, picked by the
//    VITE_APP_ENV env var set on that Render service. This needs
//    `VITE_APP_ENV=staging` added to dfm-stg's env vars on Render — until
//    that's set, every deployed build falls back to prod's URL.
export function resolveAppUrl(appId) {
  const app = appsRegistry.find((a) => a.appId === appId);
  if (!app) {
    console.log("[resolveAppUrl] no app found for id:", appId);
    return "about:blank";
  }

  if (import.meta.env.DEV) {
    console.log(`[resolveAppUrl] ${app.name}: using DEV url ->`, app.devUrl);
    return app.devUrl ?? "about:blank";
  }
  if (import.meta.env.VITE_APP_ENV === "staging") {
    console.log(`[resolveAppUrl] ${app.name}: using STAGING url ->`, app.stagingZipUrl);
    return app.stagingZipUrl ?? "about:blank";
  }
  console.log(`[resolveAppUrl] ${app.name}: using PROD url ->`, app.prodZipUrl);
  return app.prodZipUrl ?? "about:blank";
}

// Convenience for call sites that only know the app's name (e.g. a
// specific app's own settings screen, which only ever deals with itself).
// Case-insensitive — playback reads this from a saved Content row's
// configBlob.appType (e.g. "weather", lowercase), not the registry's own
// display-cased "name" field (e.g. "Weather").
export function resolveAppUrlByName(name) {
  const app = appsRegistry.find(
    (a) => a.name.toLowerCase() === name?.toLowerCase(),
  );
  return app ? resolveAppUrl(app.appId) : "about:blank";
}
