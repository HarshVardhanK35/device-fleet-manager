import { apiFetch } from "./apiClient.js";

export async function getDevices() {
  return apiFetch("http://localhost:5000/devices");
}
