import { API_BASE, getAccessToken } from "./apiClient.js";

// Not using apiFetch here — that helper always calls res.json(), but this
// endpoint returns a raw zip binary, not JSON. Needs its own auth header +
// error handling instead.
export async function fetchAppBundle(zipUrl) {
  const res = await fetch(
    `${API_BASE}/apps/fetch-bundle?url=${encodeURIComponent(zipUrl)}`,
    {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch app bundle: ${res.status}`);
  }

  return res.arrayBuffer();
}
