// Two playlists of one account can't share a name. Names are compared without caring
// about capital letters or extra spaces ("Lobby", " lobby  " and "LOBBY" are the same).
export const DUPLICATE_PLAYLIST_NAME = "You already have a playlist with this name.";

export const normalizeName = (name) => String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();

// The normalised names of `playlists`, leaving out the one with id `exceptId` (the
// playlist being renamed, which may keep its own name).
export function takenPlaylistNames(playlists, exceptId) {
  return playlists.filter((p) => p._id !== exceptId).map((p) => normalizeName(p.name));
}

// Used by: components/content/ContentPickerModal.jsx, components/playlists/EditPlaylistModal.jsx,
// components/playlists/PlaylistModals.jsx.
