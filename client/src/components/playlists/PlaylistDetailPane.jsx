import { useNavigate } from "react-router-dom";
import { Plus, Repeat, Trash2, Check, X } from "lucide-react";

import PlaylistSlotGrid from "./PlaylistSlotGrid.jsx";
import SkipButton from "./SkipButton.jsx";
import { NO_CONTENT_HINT } from "./PlaylistListPane.jsx";
import ContentToolbar from "../content/ContentToolbar.jsx";
import DetailPane from "../layout/DetailPane.jsx";
import ScrollBox from "../layout/ScrollBox.jsx";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import SkeletonGrid from "../loading/SkeletonGrid.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import RefreshButton from "../ui/RefreshButton.jsx";
import { pluralizeCount } from "../../utils/pluralize.js";

// The right pane of the Playlists page: the open playlist (title, loop badge,
// unsaved-order controls, the select / skip / remove toolbar and the grid of
// items), or the empty states when there is no playlist yet.
//   pl  what usePlaylistsPage returns
function PlaylistDetailPane({ pl }) {
  const navigate = useNavigate();
  const { playlists, content, selectedPlaylist, shownItems, visibleSlots, checkedSlotIds } = pl;

  return (
    <div className={`flex-1 min-h-0 flex-col ${pl.split || pl.mobileView === "detail" ? "flex" : "hidden"}`}>
      {pl.loading ? (
        <SkeletonGrid count={6} />
      ) : !selectedPlaylist ? (
        playlists.length === 0 ? (
          <EmptyState
            title="Create your first playlist"
            description="A playlist is an ordered list of your images, videos and apps. Put one on a screen and it plays in a loop."
            actionLabel="Create playlist"
            actionIcon={Plus}
            onAction={() => pl.setCreateOpen(true)}
            actionDisabled={pl.noContent}
            actionTitle={NO_CONTENT_HINT}
          >
            {content.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/content")}
                className="text-sm font-medium text-accent-blue hover:underline"
              >
                Your library is empty. Add content first →
              </button>
            )}
          </EmptyState>
        ) : (
          <EmptyState
            title="Select a playlist"
            description="Pick one on the left to see and edit what is in it."
          />
        )
      ) : (
        <DetailPane
          className="flex-1 min-h-0"
          bodyClassName="flex-1 min-h-0 flex flex-col"
          headerClassName="lg:pr-4"
          backLabel="Playlists"
          onBack={pl.split ? undefined : () => pl.setMobileView("list")}
          title={selectedPlaylist.name}
          badge={
            <span
              title="Plays in a loop"
              className="inline-flex flex-none items-center gap-1 h-6 px-2 rounded-full border border-border-muted text-text-muted text-xs font-semibold"
            >
              <span className="hidden md:inline">loop</span>
              <Repeat size={12} />
            </span>
          }
          meta={selectedPlaylist.description}
          actionLabel="Add content"
          actionIcon={Plus}
          onAction={() => pl.setAddContentOpen(true)}
          headerDivider
          // Side by side (lg+) the list's own Refresh already covers this page.
          refresh={
            <div className="lg:hidden">
              <RefreshButton onRefresh={pl.refreshAll} />
            </div>
          }
          actionInToolbar={shownItems.length > 0}
          titleExtra={
            shownItems.length > 0 &&
            (pl.orderDirty ? (
              <>
                <span
                  className={`hidden md:inline ml-2 whitespace-nowrap text-xs ${pl.orderError ? "text-accent-red" : "text-accent-amber"}`}
                >
                  {pl.orderError ? "Couldn't save the order" : "Unsaved order"}
                </span>
                {/* mobile: compact Discard / Save at the right end of the title row */}
                <div className="md:hidden ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={pl.handleDiscardOrder}
                    disabled={pl.savingOrder}
                    title="Discard order changes"
                    aria-label="Discard order changes"
                    className="w-8 h-8 rounded-lg border border-border-muted text-text-muted hover:bg-bg-hover flex items-center justify-center disabled:opacity-40"
                  >
                    <X size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={pl.handleSaveOrder}
                    disabled={pl.savingOrder}
                    title="Save order"
                    className="h-8 px-3 rounded-lg bg-[#1f6feb] border border-accent-blue text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Check size={14} />
                    {pl.savingOrder ? "Saving…" : "Save"}
                  </button>
                  <LoadingOverlay show={pl.savingOrder} />
                </div>
              </>
            ) : (
              <span className="ml-auto md:ml-2 whitespace-nowrap text-text-muted text-xs">
                {pluralizeCount(visibleSlots.length, "item")}
                {pl.slotFilterType === "all" && (
                  <>
                    {pl.moveButtons ? " · use ‹ › to reorder" : " · drag to reorder"}
                  </>
                )}
              </span>
            ))
          }
          headerExtra={
            pl.orderDirty && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={pl.handleDiscardOrder}
                  disabled={pl.savingOrder}
                  className="h-10 px-4 rounded-lg border border-border-muted text-text-muted hover:text-text-primary hover:bg-bg-hover text-sm font-semibold transition-colors disabled:opacity-40"
                >
                  Discard
                </button>
                <Button icon={Check} onClick={pl.handleSaveOrder} disabled={pl.savingOrder}>
                  {pl.savingOrder ? "Saving…" : "Save order"}
                </Button>
                <LoadingOverlay show={pl.savingOrder} />
              </div>
            )
          }
        >
          {shownItems.length > 0 && (
            <ContentToolbar
              checkedCount={checkedSlotIds.size}
              totalCount={visibleSlots.length}
              onToggleAll={pl.toggleAllSlots}
              actionLabel="Remove"
              actionIcon={Trash2}
              actionIconOnly
              onAction={() => pl.setSlotDeleteConfirmOpen(true)}
              beforeAction={
                <>
                  <SkipButton
                    disabled={checkedSlotIds.size === 0}
                    busy={pl.skipping}
                    unskip={pl.unskipMode}
                    onClick={pl.handleSkip}
                  />
                  <LoadingOverlay show={pl.skipping} />
                </>
              }
              filterCounts={pl.slotFilterCounts}
              filterValue={pl.slotFilterType}
              onFilterChange={pl.setSlotFilterType}
              showSort={false}
              divider={false}
              className="lg:pr-4"
            >
              {/* From md up the Add content action lives here, right of the
                  filter; below md it's DetailPane's bottom bar. */}
              <div className="hidden md:block">
                <Button icon={Plus} onClick={() => pl.setAddContentOpen(true)} title="Add content">
                  <span className="hidden @lg:inline">Add content</span>
                  <span className="@lg:hidden">Add</span>
                </Button>
              </div>
            </ContentToolbar>
          )}

          <ScrollBox className="flex-1 pr-4 pt-2">
            <PlaylistSlotGrid pl={pl} />
          </ScrollBox>
        </DetailPane>
      )}
    </div>
  );
}

export default PlaylistDetailPane;

// Used by: pages/Playlists.jsx.
