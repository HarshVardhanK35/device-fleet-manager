import { useRef } from "react";

import PlaylistDetailPane from "../components/playlists/PlaylistDetailPane.jsx";
import PlaylistListPane from "../components/playlists/PlaylistListPane.jsx";
import PlaylistModals from "../components/playlists/PlaylistModals.jsx";
import { usePlaylistsPage } from "../hooks/usePlaylistsPage.js";

function Playlists() {
  const pageRef = useRef(null);
  const pl = usePlaylistsPage(pageRef);

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto h-[calc(100dvh-88px-3.5rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-88px)] flex gap-4">
      <PlaylistListPane pl={pl} />
      <PlaylistDetailPane pl={pl} />
      <PlaylistModals pl={pl} />
    </div>
  );
}

export default Playlists;

// Playlists tab — the playlists on the left, the open playlist's items on the
// right (drag to reorder, select, skip, remove, click an item for its details).
// How it is split: hooks/usePlaylistsPage.js holds all the state and actions;
// components/playlists/ has the pieces — PlaylistListPane (the list),
// PlaylistDetailPane with PlaylistSlotGrid (the open playlist), and
// PlaylistModals (the dialogs, the item details panel and the app settings);
// this page only puts them together.
// Used by: App.jsx (route "/playlists").
