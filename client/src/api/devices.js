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
// getPairingStatus and Player.jsx's own plain-fetch /connect call).
export async function checkDeviceExists(id) {
  const res = await fetch(`${API_BASE}/devices/${id}/exists`);
  return res.json();
}

export async function unpairDevice(id) {
  const res = await fetch(`${API_BASE}/devices/${id}/unpair`, {
    method: "DELETE",
  });
  return res.json();
}

export async function disconnectDevice(id) {
  const res = await fetch(`${API_BASE}/devices/${id}/disconnect`, {
    method: "POST",
  });
  return res.json();
}
