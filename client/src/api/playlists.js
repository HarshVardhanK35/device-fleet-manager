import { apiFetch, API_BASE } from "./apiClient.js";

export async function getPlaylists() {
  return apiFetch(`${API_BASE}/playlists`);
}

export async function createPlaylist(data) {
  return apiFetch(`${API_BASE}/playlists`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlaylist(id, data) {
  return apiFetch(`${API_BASE}/playlists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePlaylist(id) {
  return apiFetch(`${API_BASE}/playlists/${id}`, {
    method: "DELETE",
  });
}
