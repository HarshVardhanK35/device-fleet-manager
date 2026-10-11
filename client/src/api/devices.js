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
