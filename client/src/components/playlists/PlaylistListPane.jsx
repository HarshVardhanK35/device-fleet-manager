import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import PlaylistRow from "./PlaylistRow.jsx";
import SelectAllBar from "../content/SelectAllBar.jsx";
import PaneToggle from "../layout/PaneToggle.jsx";
import ScrollBox from "../layout/ScrollBox.jsx";
import SkeletonPlaylistList from "../loading/SkeletonPlaylistList.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import RefreshButton from "../ui/RefreshButton.jsx";
import { COLLAPSED_PANE_CLASS } from "../../hooks/usePaneCollapse.js";
import { pluralizeCount } from "../../utils/pluralize.js";

// A playlist is made of content, so with an empty library there is nothing to
// create one from.
export const NO_CONTENT_HINT = "Add content first";

// The left pane of the Playlists page: title and count, Refresh, select all /
// delete, the playlists, and "Create playlist". On desktop it can be folded
// away (PaneToggle) so one playlist gets the whole width.
//   pl  what usePlaylistsPage returns
function PlaylistListPane({ pl }) {
  const navigate = useNavigate();
  const { playlists, noContent, checkedPlaylistIds } = pl;

  return (
    <div
      className={`relative w-full max-w-xl md:max-w-none mx-auto lg:mx-0 lg:w-80 lg:flex-shrink-0 lg:border-r lg:border-border-muted flex flex-col min-h-0 ${
        pl.mobileView === "detail" ? "hidden lg:flex" : "flex"
      } ${pl.listCollapsed ? COLLAPSED_PANE_CLASS : ""}`}
    >
      <PaneToggle collapsed={pl.listCollapsed} onToggle={pl.toggleList} />
      <div className="flex items-center gap-2 pb-3 lg:pr-4 flex-shrink-0">
        <h2 className="text-text-primary font-bold text-base m-0">Playlists</h2>
        <span className="text-text-muted text-sm tabular-nums">
          {pluralizeCount(playlists.length, "item")}
        </span>
        <RefreshButton className="ml-auto" onRefresh={pl.refreshAll} />
      </div>

      {playlists.length > 0 && (
        <SelectAllBar
          checkedCount={checkedPlaylistIds.size}
          totalCount={playlists.length}
          onToggleAll={pl.toggleAllPlaylists}
          onAction={() => pl.setBulkDeletePlaylistsOpen(true)}
          className="pb-3 lg:pr-4 flex-shrink-0"
        />
      )}

      {/* divider between the header controls and the list */}
      <div className="mb-3 border-b border-bg-hover lg:mr-4 flex-shrink-0" />

      <ScrollBox className="pr-4 pt-1">
        {pl.loading ? (
          <SkeletonPlaylistList count={4} />
        ) : (
          <div className="flex flex-col gap-2 pb-2 md:grid md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-3 lg:flex lg:flex-col lg:gap-2">
            {playlists.length === 0 && (
              <>
                {/* Below lg the right pane is hidden, so the guidance lives here. */}
                <EmptyState
                  className="lg:hidden md:col-span-full"
                  title={noContent ? "No content yet" : "Create your first playlist"}
                  description={
                    noContent
                      ? "Add images, videos or apps first."
                      : "Pick content and put it in a playlist."
                  }
                  actionLabel={noContent ? "Go to Content" : "Create playlist"}
                  actionIcon={Plus}
                  onAction={() => (noContent ? navigate("/content") : pl.setCreateOpen(true))}
                />
                <p className="hidden lg:block m-0 px-1 pt-1 text-sm text-text-muted">No playlists yet.</p>
              </>
            )}
            {playlists.map((playlist) => (
              <PlaylistRow
                key={playlist._id}
                playlist={playlist}
                active={playlist._id === pl.selectedPlaylistId}
                checked={checkedPlaylistIds.has(playlist._id)}
                selectionMode={checkedPlaylistIds.size > 0}
                onLongPress={() => pl.toggleCheckPlaylist(playlist._id)}
                onSelect={() => {
                  // Once something is ticked, a tap on a phone ticks / unticks
                  // instead of opening the playlist.
                  if (checkedPlaylistIds.size > 0 && window.matchMedia("(max-width: 1023px)").matches) {
                    pl.toggleCheckPlaylist(playlist._id);
                  } else {
                    pl.selectPlaylist(playlist._id);
                  }
                }}
                onToggleCheck={() => pl.toggleCheckPlaylist(playlist._id)}
                onEdit={() => pl.setEditPlaylistId(playlist._id)}
                onDelete={() => pl.setDeleteConfirmId(playlist._id)}
                menuOpen={pl.openMenuPlaylistId === playlist._id}
                onMenuOpenChange={(open) => pl.setOpenMenuPlaylistId(open ? playlist._id : null)}
              />
            ))}
          </div>
        )}
      </ScrollBox>

      <div className={`flex-shrink-0 pt-3 lg:pr-4 ${noContent && playlists.length === 0 ? "hidden lg:block" : ""}`}>
        <Button
          icon={Plus}
          onClick={() => pl.setCreateOpen(true)}
          disabled={noContent}
          title={noContent ? NO_CONTENT_HINT : undefined}
          className="w-full"
        >
          Create playlist
        </Button>
      </div>
    </div>
  );
}

export default PlaylistListPane;

// Used by: pages/Playlists.jsx.
