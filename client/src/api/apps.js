import { API_BASE } from "./apiClient.js";

// Not using apiFetch here — that helper always calls res.json(), but this
// endpoint returns a raw zip binary, not JSON. No auth header — this is
// called from the unauthenticated device-facing player too, and the
// backend's own URL allowlist is the real security check, not login state.
export async function fetchAppBundle(zipUrl) {
  const res = await fetch(
    `${API_BASE}/apps/fetch-bundle?url=${encodeURIComponent(zipUrl)}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch app bundle: ${res.status}`);
  }

  return res.arrayBuffer();
}
