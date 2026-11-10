import { Eye, FileDown, MoreHorizontal, Pencil, RefreshCw, Trash2, Plug } from "lucide-react";

import ScreenThumb from "../ScreenThumb.jsx";
import ReleaseScreenButton from "../ReleaseScreenButton.jsx";
import DetailPane from "../../layout/DetailPane.jsx";
import ActionMenu from "../../ui/ActionMenu.jsx";
import Button from "../../ui/Button.jsx";
import FieldCount from "../../ui/FieldCount.jsx";
import GhostButton from "../../ui/GhostButton.jsx";
import StatusPill from "../../ui/StatusPill.jsx";
import Hint from "../../../apps/appModals/announcements/common/Hint.jsx";
import { MAX_SCREEN_NAME, MAX_SCREEN_TYPE } from "../../../utils/validation/limits.js";
import { browserText, storageHints, storageText } from "./storageText.js";

const FIELD =
  "h-9 px-2.5 rounded-lg border border-border-muted bg-bg-primary text-text-primary text-sm outline-none focus-visible:border-accent-blue";

// The right-hand pane for a paired screen: preview and "now playing", the
// Name / Type details (edited in place, saved with Save changes), and the
// "Take over this screen" box.
//   edit     { editing, draft, error, onChange(field, value), onStart, onDiscard, onSave }
//   nameRef  the Name input's ref (scrolled to and focused when editing starts)
//   storage      { status, loading }: what the screen reported about its browser and offline storage
//   pulling      true while "Pull logs" waits for the screen's answer
//   refreshLeft  seconds until "Refresh screen" may be used again (0 = now); it
//                is only available while the screen is online
function ScreenDetails({
  screen,
  slot,
  edit,
  nameRef,
  refreshLeft,
  pulling,
  storage,
  releaseError,
  onBack,
  onPreview,
  onRemove,
  onTakeOver,
  onOpenPlayer,
  onRelease,
  onRefreshScreen,
  onPullLogs,
}) {
  const name = edit.editing ? edit.draft.name : screen.name;
  const type = edit.editing ? edit.draft.type : screen.type || "";
  const refreshOffline = screen.status !== "online";

  return (
    <DetailPane
      backLabel="All screens"
      onBack={onBack}
      title={screen.name}
      badge={<StatusPill screen={screen} dot />}
      meta={`Slot ${slot} · ${screen.type || "No type set"}`}
      headerExtra={
        <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Pull logs"
          onClick={onPullLogs}
          disabled={refreshOffline || pulling}
          title={
            refreshOffline
              ? "Pull logs: this screen is offline"
              : pulling
                ? "Pulling logs…"
                : "Pull logs: saves this screen's log and browser details as a .zip on this device"
          }
          className="h-8 px-2.5 rounded-md flex items-center justify-center gap-1.5 text-xs font-medium text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors flex-none disabled:opacity-40 disabled:pointer-events-none"
        >
          <FileDown size={16} />
          {pulling ? "Pulling…" : "Pull logs"}
        </button>
        <ActionMenu
          label="Screen actions"
          align="end"
          items={[
            { label: "Edit", icon: Pencil, onClick: edit.onStart },
            { label: "Preview", icon: Eye, onClick: onPreview },
            {
              label: "Refresh screen",
              icon: RefreshCw,
              variant: "success",
              onClick: onRefreshScreen,
              disabled: refreshOffline || refreshLeft > 0,
              hint: !refreshOffline && refreshLeft > 0 ? `${refreshLeft} s` : undefined,
              title: refreshOffline
                ? "This screen is offline"
                : refreshLeft > 0
                  ? `You can refresh it again in ${refreshLeft} s`
                  : "Restarts the playlist from the first item on this screen",
            },
            { type: "separator" },
            { label: "Remove screen", icon: Trash2, variant: "danger", onClick: onRemove },
          ]}
          trigger={
            <button
              type="button"
              aria-label="Screen actions"
              className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors flex-none"
            >
              <MoreHorizontal size={18} />
            </button>
          }
        />
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-[1.5] min-w-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={onPreview}
              // 16:9 at least; on desktop it grows to the height of the column beside it
              className="aspect-video lg:flex-1 rounded-lg overflow-hidden border border-border-muted hover:border-border-hover transition-colors block w-full"
            >
              <ScreenThumb playing={screen.playing} />
            </button>
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            {[
              ["Now playing", screen.playing ? screen.playing.playlistName : "Nothing scheduled"],
              [
                "Item",
                screen.playing
                  ? `${screen.playing.name}${screen.playing.pos ? ` · ${screen.playing.pos}` : ""}`
                  : "—",
              ],
              ["Up next", screen.playing ? screen.playing.nextName || "—" : "—"],
              ["Connection", screen.seen],
              ["Resolution", screen.res],
              ["Browser", browserText(storage.status, storage.loading)],
              ["Offline storage", storageText(storage.status, storage.loading, !refreshOffline)],
            ].map(([label, value], i, arr) => (
              <div
                key={label}
                className={`flex justify-between gap-3 py-2.5 text-xs ${
                  i < arr.length - 1 ? "border-b border-bg-hover" : ""
                }`}
              >
                <span className="text-text-muted">{label}</span>
                <span className="text-text-primary text-right">{value}</span>
              </div>
            ))}
            {/* pinned to the bottom of the column, level with the preview's bottom edge */}
            <div className="mt-auto pt-4 flex flex-col gap-2">
              <Hint text="Click the preview to watch it — the physical screen isn't affected." />
              <Hint text="Screen stuck or showing old content? ⋯ → Refresh screen." />
              {storageHints(storage.status).map((text) => (
                <Hint key={text} text={text} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-border-muted">
          <span className="text-text-primary text-sm font-semibold">Details</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
              <span className="flex items-center justify-between">
                Name
                <FieldCount value={name} max={MAX_SCREEN_NAME} />
              </span>
              <input
                ref={nameRef}
                maxLength={MAX_SCREEN_NAME}
                value={name}
                onChange={(e) => edit.onChange("name", e.target.value)}
                className={FIELD}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
              <span className="flex items-center justify-between">
                Type
                <FieldCount value={type} max={MAX_SCREEN_TYPE} />
              </span>
              <input
                maxLength={MAX_SCREEN_TYPE}
                value={type}
                onChange={(e) => edit.onChange("type", e.target.value)}
                placeholder="Free text — TV, iPad, kiosk monitor…"
                className={FIELD}
              />
            </label>
          </div>
          {edit.editing && (
            <div className="flex flex-col gap-2">
              {edit.error && <span className="text-accent-red text-xs">{edit.error}</span>}
              <div className="flex gap-2">
                <GhostButton size="lg" onClick={edit.onDiscard}>
                  Discard
                </GhostButton>
                <Button onClick={edit.onSave}>Save changes</Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-lg border border-accent-red/35 bg-accent-red/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="flex items-center gap-2 text-accent-red text-sm font-semibold">
                <Plug size={15} />
                Take over this screen
              </span>
              <span className="text-text-muted text-xs leading-relaxed">
                <span className="lg:hidden">
                  Plays the screen here and disconnects the real one. Only one connection per screen.
                </span>
                <span className="hidden lg:inline">
                  Opens the full player here and disconnects the physical screen at once — only one connection per
                  screen is allowed.
                </span>
              </span>
            </div>
            {screen.status !== "taken" ? (
              <Button
                icon={Plug}
                onClick={onTakeOver}
                className="!bg-accent-red !border-accent-red hover:!brightness-110 flex-none"
              >
                Take over…
              </Button>
            ) : (
              <div className="flex gap-2 flex-wrap flex-none">
                <button
                  type="button"
                  onClick={onOpenPlayer}
                  className="h-9 px-3 rounded-lg border border-border-muted bg-bg-hover text-text-primary text-xs font-medium transition-colors"
                >
                  Open player
                </button>
                <ReleaseScreenButton onClick={onRelease} />
              </div>
            )}
          </div>
          {releaseError && <span className="text-accent-red text-xs">{releaseError}</span>}
        </div>
      </div>
    </DetailPane>
  );
}

export default ScreenDetails;

// Used by: pages/PlayerSlots.jsx.
