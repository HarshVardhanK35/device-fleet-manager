export async function getPlaylists() {
  const res = await fetch("http://localhost:5000/playlists");
  const data = await res.json();
  return data;
}

export async function createPlaylist(data) {
  const res = await fetch("http://localhost:5000/playlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
