// Falls back to the local backend when unset, same pattern as the MQTT env
// vars in components/DevicePlayback.jsx — deployed builds get the real
// backend URL baked in at build time via Vite.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// In-memory only — never localStorage. This is the XSS fix: a token that
// only ever lives in a JS variable can't be read by `localStorage.getItem`
// from an injected script, and dies automatically on tab close/reload.
let accessToken = null;

// A short-lived in-memory cache for the lists that only the user's own actions
// change (content, playlists), so moving between pages doesn't fetch the same
// list again. Cleared by every non-GET request, by every sign-in / sign-out /
// token change, and by the Refresh button, so it never hides a change. Lists
// the server changes by itself (devices, assignments) are not cached.
const CACHE_TTL_MS = 30000;
const listCache = new Map(); // url -> { at, data }
const listInflight = new Map(); // url -> promise

export function clearApiCache() {
  listCache.clear();
  listInflight.clear();
  getsInFlight.clear(); // a GET started before a change must not be joined after it
}

export async function cachedGet(url) {
  const hit = listCache.get(url);
  if (hit && new Date().getTime() - hit.at < CACHE_TTL_MS) return structuredClone(hit.data);
  if (!listInflight.has(url)) {
    const request = apiFetch(url)
      .then((data) => {
        // Only a real list is worth keeping; an error message is not.
        if (Array.isArray(data)) listCache.set(url, { at: new Date().getTime(), data });
        return data;
      })
      .finally(() => listInflight.delete(url));
    listInflight.set(url, request);
  }
  return structuredClone(await listInflight.get(url));
}

export function setAccessToken(token) {
  clearApiCache();
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Raised so components/ConnectionBanner.jsx can show "Can't reach the server"
// and hide it again once a request succeeds.
let serverDown = false;
function reportDown() {
  if (!serverDown) {
    serverDown = true;
    window.dispatchEvent(new Event("castwise:api-down"));
  }
}
function reportUp() {
  if (serverDown) {
    serverDown = false;
    window.dispatchEvent(new Event("castwise:api-up"));
  }
}

async function tryRefresh() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (data.token) {
    accessToken = data.token;
    return data.token;
  }
  return null;
}

async function request(url, options = {}, _retried = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    reportDown();
    throw err;
  }
  reportUp();
  if ((options.method || "GET").toUpperCase() !== "GET") clearApiCache();

  if (res.status === 401) {
    // Access token expired mid-session — try one silent refresh using the
    // httpOnly refresh cookie before giving up, so a 15-min access token
    // doesn't interrupt the user every 15 minutes.
    if (!_retried) {
      const newToken = await tryRefresh();
      if (newToken) {
        return request(url, options, true);
      }
    }
    accessToken = null;
    window.location.href = "/login?expired=1";
    return null;
  }

  return res.json();
}

// Identical GET requests that are in flight at the same moment share one
// network call (React's dev double-run of effects, or two components asking for
// the same list together). Nothing is kept afterwards, so it never serves stale
// data. Every other request goes straight through.
const getsInFlight = new Map(); // url -> promise

export function apiFetch(url, options = {}, _retried = false) {
  const isGet = (options.method || "GET").toUpperCase() === "GET" && !options.body;
  if (!isGet || _retried) return request(url, options, _retried);

  if (!getsInFlight.has(url)) {
    const promise = request(url, options).finally(() => {
      if (getsInFlight.get(url) === promise) getsInFlight.delete(url);
    });
    getsInFlight.set(url, promise);
  }
  return getsInFlight.get(url).then((data) => (data === null || data === undefined ? data : structuredClone(data)));
}
