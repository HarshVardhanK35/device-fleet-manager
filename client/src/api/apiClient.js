const API_BASE = "http://localhost:5000";

// In-memory only — never localStorage. This is the XSS fix: a token that
// only ever lives in a JS variable can't be read by `localStorage.getItem`
// from an injected script, and dies automatically on tab close/reload.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
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

export async function apiFetch(url, options = {}, _retried = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Access token expired mid-session — try one silent refresh using the
    // httpOnly refresh cookie before giving up, so a 15-min access token
    // doesn't interrupt the user every 15 minutes.
    if (!_retried) {
      const newToken = await tryRefresh();
      if (newToken) {
        return apiFetch(url, options, true);
      }
    }
    accessToken = null;
    window.location.href = "/login";
    return null;
  }

  return res.json();
}
