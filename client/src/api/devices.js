import { apiFetch } from "./apiClient.js";

export async function getDevices() {
  return apiFetch("http://localhost:5000/devices");
}

export async function updateDevice(id, data) {
  return apiFetch(`http://localhost:5000/devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDevice(id) {
  return apiFetch(`http://localhost:5000/devices/${id}`, {
    method: "DELETE",
  });
}

export async function takeOverDevice(id) {
  return apiFetch(`http://localhost:5000/devices/${id}/take-over`, {
    method: "POST",
  });
}

export async function releaseDevice(id) {
  return apiFetch(`http://localhost:5000/devices/${id}/release`, {
    method: "POST",
  });
}

// Unauthenticated — called from pages/Screens.jsx, which has no logged-in
// user (same reasoning as api/pairing.js's generatePairingCode/
// getPairingStatus and Player.jsx's own plain-fetch /connect call).
export async function checkDeviceExists(id) {
  const res = await fetch(`http://localhost:5000/devices/${id}/exists`);
  return res.json();
}

export async function unpairDevice(id) {
  const res = await fetch(`http://localhost:5000/devices/${id}/unpair`, {
    method: "DELETE",
  });
  return res.json();
}

export async function disconnectDevice(id) {
  const res = await fetch(`http://localhost:5000/devices/${id}/disconnect`, {
    method: "POST",
  });
  return res.json();
}
