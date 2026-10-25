import { useState, useRef, useEffect } from "react";
import { Trash2, Pencil, Settings2 } from "lucide-react";

import Button from "./Button.jsx";
import CancelButton from "./CancelButton.jsx";
import ScrollBox from "./ScrollBox.jsx";
import { getTypeMeta } from "../utils/contentTypeMeta.js";
import {
  DURATION_UNIT_CYCLE,
  parseDurationInput,
  isDurationInRange,
  formatDurationHuman,
  secondsToUnitDisplay,
} from "../utils/durationInput.js";

const DURATION_PRESETS = [5, 10, 15, 30, 60];
// Fewer presets shown while Custom is active (editing) — frees up row
// width for the number input + unit badge instead of cramming all 6 items
// into one row.
const DURATION_PRESETS_COMPACT = [10, 15, 30];
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
// `onOpenAppSettings` (app items only) opens that app's own full settings
// modal (location, refresh interval, etc.) — this panel only ever edits
// name + duration, the two fields every content type shares.
function ContentDetailsPanel({ item, onClose, onSave, onDelete, onOpenAppSettings }) {
  const [name, setName] = useState(item.name);
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
  // Media RSS computes its own duration from its own settings (item count ×
  // per-item dwell time, see rss-modal.jsx's computeRssDuration) — editing
  // it here would just get silently overwritten the next time that app's
  // settings are saved, so this panel shows it read-only instead of letting
  // it drift out of sync with the real rotation time.
  const isAutoDuration = item.type === "app" && item.configBlob?.appType === "rss";
  const showDuration = item.type !== "video" && !isAutoDuration;

  function handleSave() {
    // Use the freshly-typed value even if the input never blurred (e.g.
    // Save clicked while it still has focus) — `durationSec` itself only
    // syncs on blur.
    const effectiveSec =
      customMode && customParsed && isDurationInRange(customParsed.seconds)
        ? customParsed.seconds
        : Number(durationSec);

    onSave(item._id, {
      name,
      // `undefined` leaves the field untouched server-side — both for
      // video (never had a duration field here) and for auto-duration
      // apps (their own settings screen owns this value).
      durationInMillis: showDuration ? effectiveSec * 1000 : undefined,
    });
  }

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 z-40 md:static md:top-auto md:left-auto md:right-auto md:bottom-auto md:z-auto md:w-[320px] md:flex-shrink-0 md:h-full bg-bg-panel border-0 md:border md:border-border-muted rounded-none md:rounded-xl flex flex-col overflow-hidden">
      <div className="flex-none flex items-center justify-between px-4 py-2.5 border-b border-border-muted">
        <h3 className="text-text-primary font-bold">Details</h3>
        <CancelButton onClick={onClose} title="Close" />
      </div>

      <ScrollBox>
        <div className="flex flex-col gap-4 px-4 py-5">
          <div className="relative aspect-video bg-[#201e1e] border border-border-muted rounded-lg flex items-center justify-center overflow-hidden">
            {item.type === "app" ? (
              <span className="text-text-muted text-sm">App</span>
            ) : (
              <img
                src={item.thumbnailUrl || item.mediaUrl}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            )}

            <span
              className={`absolute left-1.5 bottom-1.5 inline-flex items-center justify-center w-fit text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${meta.textClass} ${meta.bgClass}`}
            >
              {meta.label}
            </span>
          </div>

          <div>
            <label className="block text-text-primary text-xs font-semibold mb-1.5">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                  Auto-calculated from this app&apos;s layout/speed/item count.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollBox>

      <div className="flex-none flex items-center justify-between px-4 py-2.5 border-t border-border-muted">
        <button
          onClick={() => onDelete(item)}
          className="w-9 h-9 rounded-md border border-accent-red/40 text-accent-red hover:bg-accent-red/10 flex items-center justify-center transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Cancel
          </button>
          <Button onClick={handleSave} disabled={customInvalid}>
            Save
          </Button>
        </div>
      </div>
    </div>
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
