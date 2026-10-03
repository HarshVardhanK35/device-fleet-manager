import { apiFetch } from "./apiClient";

export async function getPlaylists() {
  return apiFetch("http://localhost:5000/playlists");
}

export async function createPlaylist(data) {
  return apiFetch("http://localhost:5000/playlists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlaylist(id, data) {
  return apiFetch(`http://localhost:5000/playlists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePlaylist(id) {
  return apiFetch(`http://localhost:5000/playlists/${id}`, {
    method: "DELETE",
  });
}
