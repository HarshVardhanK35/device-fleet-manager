import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";

import Button from "./Button.jsx";
import CancelButton from "./CancelButton.jsx";
import { getTypeMeta } from "../utils/contentTypeMeta.js";

const DURATION_PRESETS = [5, 10, 15, 30, 60];

// Parent must render this with `key={item._id}` and only when `item` is
// truthy — the key forces a remount (fresh initial state) whenever a
// different item is inspected, instead of syncing props into state via a
// useEffect (an anti-pattern: see react-hooks/set-state-in-effect).
function ContentDetailsPanel({ item, onClose, onSave, onDelete }) {
  const [name, setName] = useState(item.name);
  const [durationSec, setDurationSec] = useState(
    item.durationInMillis ? item.durationInMillis / 1000 : "",
  );

  const meta = getTypeMeta(item.type);
  const showDuration = item.type !== "video";

  function handleSave() {
    onSave(item._id, {
      name,
      durationInMillis: showDuration ? Number(durationSec) * 1000 : undefined,
    });
  }

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 z-40 md:static md:top-auto md:left-auto md:right-auto md:bottom-auto md:z-auto md:w-[320px] md:flex-shrink-0 md:h-fit bg-bg-panel border-0 md:border md:border-border-muted rounded-none md:rounded-xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
        <h3 className="text-text-primary font-bold">Details</h3>
        <CancelButton onClick={onClose} />
      </div>

      <div className="flex flex-col gap-4 p-5 flex-1 min-h-0 overflow-y-auto md:flex-none md:overflow-visible">
        <div className="aspect-video bg-[#201e1e] border border-border-muted rounded-lg flex items-center justify-center overflow-hidden">
          {item.type === "app" ? (
            <span className="text-text-muted text-sm">App</span>
          ) : (
            <img
              src={item.thumbnailUrl || item.mediaUrl}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <span
          className={`inline-flex items-center justify-center w-fit text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${meta.textClass} ${meta.bgClass}`}
        >
          {meta.label}
        </span>

        <div>
          <label className="block text-text-muted text-xs font-semibold mb-1.5">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-bg-primary border border-border-muted hover:border-border-hover text-text-primary px-2 py-1.5 rounded-lg w-full outline-none transition-colors focus-visible:ring-1 focus-visible:ring-accent-blue"
          />
        </div>

        {showDuration && (
          <div>
            <label className="block text-text-muted text-xs font-semibold mb-1.5">
              Display duration
            </label>
            <div className="flex gap-1.5">
              {DURATION_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDurationSec(s)}
                  className={`flex-1 text-sm py-1.5 rounded-lg border transition-colors ${
                    Number(durationSec) === s
                      ? "bg-accent-blue border-accent-blue text-white"
                      : "bg-bg-primary border-border-muted text-text-muted hover:border-border-hover hover:bg-bg-hover"
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 bg-bg-primary border border-border-muted hover:border-border-hover transition-colors rounded-lg px-2 py-2.5">
              <span className="text-text-muted text-xs">Custom</span>
              <input
                type="number"
                min="1"
                value={durationSec}
                onChange={(e) => setDurationSec(e.target.value)}
                className="flex-1 bg-transparent text-text-primary text-sm outline-none text-right"
              />
              <span className="text-text-muted text-xs">sec</span>
              <div className="flex flex-col -my-1">
                <button
                  type="button"
                  onClick={() => setDurationSec((v) => Number(v || 0) + 1)}
                  className="text-text-muted hover:text-text-primary leading-none"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDurationSec((v) => Math.max(1, Number(v || 0) - 1))
                  }
                  className="text-text-muted hover:text-text-primary leading-none"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-border-muted">
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
          <Button onClick={handleSave}>Save</Button>
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
// exists in our Content schema.
// Below `md`, renders as a full-screen overlay (fixed, below the header)
// instead of a 320px sidebar, matching the mock's mobile behavior.
// Used by: pages/Content.jsx.
