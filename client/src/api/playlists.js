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
