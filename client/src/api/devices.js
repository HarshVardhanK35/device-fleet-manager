import { apiFetch, API_BASE } from "./apiClient.js";

export async function getDevices() {
  return apiFetch(`${API_BASE}/devices`);
}

export async function updateDevice(id, data) {
  return apiFetch(`${API_BASE}/devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDevice(id) {
  return apiFetch(`${API_BASE}/devices/${id}`, {
    method: "DELETE",
  });
}

export async function takeOverDevice(id) {
  return apiFetch(`${API_BASE}/devices/${id}/take-over`, {
    method: "POST",
  });
}

export async function releaseDevice(id) {
  return apiFetch(`${API_BASE}/devices/${id}/release`, {
    method: "POST",
  });
}

// Unauthenticated — called from pages/Screens.jsx, which has no logged-in
// user (same reasoning as api/pairing.js's generatePairingCode/
// getPairingStatus and DevicePlayback.jsx's own plain-fetch /connect
// call). Keyed by Device.accessToken (a long random token), not the real
// Mongo _id — Phase 3 fix, 2026-10-12: these routes are fully public, so
// the identifier they trust has to be unguessable and revocable.
export async function checkDeviceExists(token) {
  const res = await fetch(`${API_BASE}/devices/${token}/exists`);
  return res.json();
}

export async function unpairDevice(token) {
  const res = await fetch(`${API_BASE}/devices/${token}/unpair`, {
    method: "DELETE",
  });
  return res.json();
}

export async function disconnectDevice(token) {
  const res = await fetch(`${API_BASE}/devices/${token}/disconnect`, {
    method: "POST",
  });
  return res.json();
}
