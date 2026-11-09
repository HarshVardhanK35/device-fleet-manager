import { useState, useRef, useEffect } from "react";
import { Trash2, Pencil, Settings2 } from "lucide-react";

import Button from "../ui/Button.jsx";
import AppThumb from "../ui/AppThumb.jsx";
import ToggleSwitch from "../../apps/shared/fields/ToggleSwitch.jsx";
import { appTypeOf } from "../../utils/appType.js";
import { rssSecondsPerItem } from "../../apps/rssTiming.js";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import CancelButton from "../ui/CancelButton.jsx";
import ScrollBox from "../layout/ScrollBox.jsx";
import { getTypeMeta } from "../../utils/contentTypeMeta.js";
import BlurImage from "../ui/BlurImage.jsx";
import FieldCount from "../ui/FieldCount.jsx";
import { MAX_APP_NAME, MAX_CONTENT_NAME } from "../../utils/limits.js";
import { useMediaQuery } from "../../hooks/useCompactLayout.js";
import {
  DURATION_UNIT_CYCLE,
  parseDurationInput,
  isDurationInRange,
  formatDurationHuman,
  secondsToUnitDisplay,
} from "../../utils/durationInput.js";

const DURATION_PRESETS = [5, 10, 15, 30, 60];
// Fewer presets shown while Custom is active (editing) — frees up row
// width for the number input + unit badge instead of cramming all 6 items
// into one row.
const DURATION_PRESETS_COMPACT = [10, 15, 30];
// App types whose duration is derived from their own settings, not edited here.
const AUTO_DURATION_APPS = ["rss", "announcements"];
// ...except Status List, a static board whose duration is user-set.
const MANUAL_DURATION_TEMPLATES = ["status-list"];
const CUSTOM_UNIT_LABELS = { s: "sec", min: "min", h: "hrs" };

// Nicest unit to show an existing saved value in on open — whole hours if
// it divides evenly, else whole minutes, else seconds.
function deriveCustomUnit(sec) {
  if (!sec) return "s";
  if (sec % 3600 === 0) return "h";
  if (sec % 60 === 0) return "min";
  return "s";
}

// Parent must render this with `key={item._id}` and only when `item` is
// truthy — the key forces a remount (fresh initial state) whenever a
// different item is inspected, instead of syncing props into state via a
// useEffect (an anti-pattern: see react-hooks/set-state-in-effect).
// `showFit` (the Playlists page only) adds the "Fill the screen" switch for images and
// videos; the Content page leaves it out and never changes that setting.
// `onDelete` is optional: the Playlists page leaves it out, so the library item
// can't be deleted from there (the button is not shown).
// `onOpenAppSettings` (app items only) opens that app's own full settings
// modal (location, refresh interval, etc.) — this panel only ever edits
// name + duration, the two fields every content type shares.
function ContentDetailsPanel({ item, dockSide = "right", dockLeft = 0, showFit = false, onClose, onSave, onDelete, onOpenAppSettings }) {
  const [name, setName] = useState(item.name);
  // "Fill the screen" (images and videos): on crops the edges to fill it, off shows the
  // whole frame. Unset means the type's default: images fill, videos show whole.
  const [fill, setFill] = useState(item.fit ? item.fit === "cover" : item.type === "image");
  const hasFit = showFit && (item.type === "image" || item.type === "video");
  const [durationSec, setDurationSec] = useState(
    item.durationInMillis ? item.durationInMillis / 1000 : "",
  );
  // The "Custom" slot is its own pill (dashed, unselected) until clicked —
  // then it becomes an inline input, same size/row as the presets, per the
  // approved mock. Starts already in input mode if the saved duration isn't
  // one of the presets (so an existing custom value is visible on open).
  const [customMode, setCustomMode] = useState(
    !DURATION_PRESETS.includes(Number(durationSec)),
  );
  // Unit shown in the toggle badge (s/min/h) and the raw text the user is
  // editing — kept separate from `durationSec` so mid-typing/invalid text
  // (e.g. "0", a half-typed "5m") never corrupts the authoritative value
  // used for Save/preset-highlighting. `durationSec` only updates once the
  // typed text parses to something in range.
  const [customUnit, setCustomUnit] = useState(() =>
    deriveCustomUnit(Number(durationSec) || 0),
  );
  const [customRaw, setCustomRaw] = useState(() =>
    DURATION_PRESETS.includes(Number(durationSec)) || !durationSec
      ? ""
      : secondsToUnitDisplay(Number(durationSec), customUnit),
  );
  const customInputRef = useRef(null);

  const customParsed = customMode ? parseDurationInput(customRaw, customUnit) : null;
  const customInvalid =
    customMode && (!customParsed || !isDurationInRange(customParsed.seconds));

  function handleCustomBlur() {
    if (customParsed && isDurationInRange(customParsed.seconds)) {
      setDurationSec(customParsed.seconds);
      setCustomUnit(customParsed.unit);
      setCustomRaw(secondsToUnitDisplay(customParsed.seconds, customParsed.unit));
    }
    if (!customRaw.trim()) setCustomMode(false);
  }

  function cycleCustomUnit() {
    const base =
      customParsed && isDurationInRange(customParsed.seconds)
        ? customParsed.seconds
        : Number(durationSec) || 0;
    const nextUnit =
      DURATION_UNIT_CYCLE[(DURATION_UNIT_CYCLE.indexOf(customUnit) + 1) % DURATION_UNIT_CYCLE.length];
    setCustomUnit(nextUnit);
    setCustomRaw(base ? secondsToUnitDisplay(base, nextUnit) : "");
  }

  useEffect(() => {
    if (customMode) customInputRef.current?.focus();
  }, [customMode]);

  const meta = getTypeMeta(item.type);
  // Media RSS, Rotating Notices and Event Cards compute their own duration
  // from their own settings (RSS: item count × dwell time; the other two: the
  // sum of their boards / cards). Status List is a static board, so its
  // duration is the user's to set here. Editing a computed one here
  // would just get silently overwritten the next time that app's settings
  // are saved, so this panel shows it read-only instead of letting it drift
  // out of sync with the real rotation time.
  const isAutoDuration =
    item.type === "app" &&
    AUTO_DURATION_APPS.includes(item.configBlob?.appType) &&
    !MANUAL_DURATION_TEMPLATES.includes(item.configBlob?.template);
  const showDuration = item.type !== "video" && !isAutoDuration;

  const [handleSave, saving] = useAsyncAction(async () => {
    // Use the freshly-typed value even if the input never blurred (e.g.
    // Save clicked while it still has focus) — `durationSec` itself only
    // syncs on blur.
    const effectiveSec =
      customMode && customParsed && isDurationInRange(customParsed.seconds)
        ? customParsed.seconds
        : Number(durationSec);

    await onSave(item._id, {
      name,
      // `undefined` leaves the field untouched server-side — both for
      // video (never had a duration field here) and for auto-duration
      // apps (their own settings screen owns this value).
      durationInMillis: showDuration ? effectiveSec * 1000 : undefined,
      fit: hasFit ? (fill ? "cover" : "contain") : undefined,
    });
  });

  // Enter in the name or custom-duration field saves, same as the Save button.
  function saveOnEnter(e) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (!customInvalid && !saving) handleSave();
  }

  // xl and up: a floating panel over the page (the tiles keep their size); below
  // that: a centred modal over a blurred page.
  const sidePanel = useMediaQuery("(min-width: 1280px)");

  const inner = (
    <>
      <div className="flex-none flex items-center justify-between px-4 py-2.5 border-b border-border-muted">
        <h3 className="text-text-primary font-bold">Details</h3>
        <CancelButton onClick={onClose} title="Close" />
      </div>

      <ScrollBox>
        <div className="flex flex-col gap-4 px-4 py-5">
          <div className="relative aspect-video bg-[#201e1e] border border-border-muted rounded-lg flex items-center justify-center overflow-hidden">
            {item.type === "app" ? (
              <AppThumb appType={appTypeOf(item)} iconClassName="w-[18%]" />
            ) : (
              <BlurImage url={item.thumbnailUrl || item.mediaUrl} width={800} alt={item.name} fit="contain" />
            )}

            <span
              className={`absolute left-1.5 bottom-1.5 inline-flex items-center justify-center w-fit text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${meta.textClass} ${meta.solidBgClass}`}
            >
              {meta.label}
            </span>
          </div>

          <div>
            <label className="flex items-center justify-between text-text-primary text-xs font-semibold mb-1.5">
              Name
              <FieldCount value={name} max={item.type === "app" ? MAX_APP_NAME : MAX_CONTENT_NAME} />
            </label>
            <input
              value={name}
              maxLength={item.type === "app" ? MAX_APP_NAME : MAX_CONTENT_NAME}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={saveOnEnter}
              className="bg-bg-primary border border-border-muted hover:border-border-hover text-text-primary px-2 py-1.5 rounded-lg w-full outline-none transition-colors focus-visible:ring-1 focus-visible:ring-accent-blue"
            />
          </div>

          {onOpenAppSettings && (
            <button
              type="button"
              onClick={onOpenAppSettings}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-text-primary bg-bg-primary border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-lg px-3 py-2 transition-colors"
            >
              <Settings2 size={14} />
              Edit app settings
            </button>
          )}

          {hasFit && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-primary text-xs font-semibold">Fill the screen</span>
                <ToggleSwitch checked={fill} onChange={setFill} />
              </div>
              <p className="m-0 text-text-muted text-xs">
                {fill
                  ? "Fills the whole screen. The edges may be cropped when the shapes differ."
                  : "Shows the whole picture, with bars where the shapes differ."}
              </p>
            </div>
          )}

          {showDuration && (
            <div>
              <label className="block text-text-primary text-xs font-semibold mb-1.5">
                Display duration
              </label>
              <div className="flex gap-1.5">
                {(customMode ? DURATION_PRESETS_COMPACT : DURATION_PRESETS).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setCustomMode(false);
                      setDurationSec(s);
                    }}
                    className={`flex-1 text-sm py-1.5 rounded-lg border transition-colors ${
                      !customMode && Number(durationSec) === s
                        ? "bg-accent-blue border-accent-blue text-white"
                        : "bg-bg-primary border-border-muted text-text-muted hover:border-white hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    {s}s
                  </button>
                ))}

                {customMode ? (
                  <div
                    className={`flex-[2] flex items-stretch gap-1 text-sm py-1 pl-2 pr-1 rounded-lg border bg-bg-primary ${
                      customInvalid ? "border-accent-red" : "border-accent-blue"
                    }`}
                  >
                    <input
                      ref={customInputRef}
                      type="text"
                      inputMode="decimal"
                      value={customRaw}
                      onChange={(e) => setCustomRaw(e.target.value)}
                      onBlur={handleCustomBlur}
                      onKeyDown={saveOnEnter}
                      className="w-0 flex-1 bg-transparent text-text-primary text-sm font-bold outline-none text-right"
                    />
                    <button
                      type="button"
                      title="Switch units"
                      onClick={cycleCustomUnit}
                      className="flex-none px-1.5 rounded-md border border-border-muted bg-bg-panel text-text-muted text-xs font-semibold hover:border-white hover:text-text-primary transition-colors"
                    >
                      {CUSTOM_UNIT_LABELS[customUnit]}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const base = Number(durationSec) || 0;
                      setCustomUnit("min");
                      setCustomRaw(base ? secondsToUnitDisplay(base, "min") : "");
                      setCustomMode(true);
                    }}
                    className="flex-[1.4] flex items-center justify-center gap-1 text-sm py-1.5 px-2 rounded-lg border-1 border-dashed border-border-muted bg-bg-primary text-text-muted hover:border-white hover:bg-bg-hover hover:text-text-primary transition-colors"
                  >
                    <Pencil size={12} />
                    Custom
                  </button>
                )}
              </div>

              {customMode && (
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {customInvalid ? (
                    <span className="text-accent-red text-xs">Enter 1 s – 24 h</span>
                  ) : (
                    <span className="text-text-muted text-xs">
                      = {formatDurationHuman(customParsed.seconds)}
                    </span>
                  )}
                  <span className="text-text-muted/70 text-xs">
                    Try 5m, 90s or 1:30
                  </span>
                </div>
              )}
            </div>
          )}

          {item.type === "video" && (
            <div>
              <label className="block text-text-primary text-xs font-semibold mb-1.5">
                Display duration
              </label>
              <div className="bg-bg-primary border border-border-muted rounded-lg px-3 py-2.5">
                <p className="text-text-muted text-xs m-0">
                  A video&apos;s duration can&apos;t be edited. It always plays for its full length.
                </p>
              </div>
            </div>
          )}

          {isAutoDuration && (
            <div>
              <label className="block text-text-primary text-xs font-semibold mb-1.5">
                Display duration
              </label>
              <div className="bg-bg-primary border border-border-muted rounded-lg px-3 py-2.5">
                <span className="text-text-primary text-sm font-bold">
                  {formatDurationHuman(Math.round((item.durationInMillis || 0) / 1000))}
                </span>
                <p className="text-text-muted text-xs mt-1 mb-0">
                  {item.configBlob?.appType === "rss" && item.configBlob?.itemCount
                    ? `Auto-calculated: ${item.configBlob.itemCount} items × ${rssSecondsPerItem(item.configBlob)} s per item. Change the item count or scroll speed in Edit app settings.`
                    : "Auto-calculated from this app's settings."}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollBox>

      <div className="flex-none flex items-center justify-between px-4 py-2.5 border-t border-border-muted">
        {onDelete ? (
          <button
            onClick={() => onDelete(item)}
            className="w-9 h-9 rounded-md border border-accent-red/40 text-accent-red hover:bg-accent-red/10 flex items-center justify-center transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Cancel
          </button>
          <Button onClick={handleSave} disabled={customInvalid || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      <LoadingOverlay show={saving} />
    </>
  );

  return sidePanel ? (
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-20" />
      <aside
        style={dockSide === "left" ? { left: dockLeft } : undefined}
        className={`${dockSide === "left" ? "cw-panel-in-left" : "cw-panel-in right-4"} fixed top-[72px] bottom-4 z-30 w-[320px] flex flex-col overflow-hidden bg-bg-panel border border-border-muted rounded-xl shadow-2xl`}
      >
        {inner}
      </aside>
    </>
  ) : (
    <>
      <div aria-hidden="true" onClick={onClose} className="cw-scrim-in fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
        <div className="cw-pop-in pointer-events-auto w-full max-w-[420px] max-h-full flex flex-col overflow-hidden bg-bg-panel border border-border-muted rounded-xl shadow-2xl">
          {inner}
        </div>
      </div>
    </>
  );
}

export default ContentDetailsPanel;

// Right-side "inspect a single content item" slide-in panel, replacing the
// old centered Settings modal — matches the Content Library mock's
// always-visible inspector pattern. Preview, type badge, Name field, and
// (image/app only, not video) a duration preset button group + custom
// numeric field. Folder field from the mock is omitted — no folder concept
// exists in our Content schema. App items get one extra button ("Edit app
// settings") that hands off to that app's own full settings modal for its
// app-specific fields — this panel only ever edits name + duration.
// Below `md`, renders as a full-screen overlay (fixed, below the header)
// instead of a 320px sidebar, matching the mock's mobile behavior.
// Used by: pages/Content.jsx.
