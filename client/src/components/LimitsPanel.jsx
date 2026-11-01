import { MAX_IMAGES, MAX_VIDEO_BYTES, MAX_SCREENS, formatMB } from "../utils/limits.js";

// One rule for all three bars: green up to 40% of the limit, amber from 40% to
// 80%, red above 80%. So screens go green (1 of 3) -> amber (2 of 3) -> red
// (3 of 3, all slots used); images turn amber after 12 and red after 24;
// video turns amber after 60MB and red after 120MB.
function tone(used, max) {
  const p = used / max;
  if (p > 0.8) return { bar: "bg-accent-red", text: "text-accent-red" };
  if (p > 0.4) return { bar: "bg-accent-amber", text: "text-accent-amber" };
  return { bar: "bg-accent-green", text: "text-accent-green" };
}

function LimitRow({ label, used, max, usedText, maxText }) {
  const t = tone(used, max);
  const percent = Math.min(100, (used / max) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className={`text-xs tabular-nums whitespace-nowrap ${t.text}`}>
          {usedText} of {maxText}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        className="w-full h-2 bg-bg-hover rounded-full overflow-hidden"
      >
        <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Dashboard "Usage and limits": the three real caps as progress bars — images,
// video storage and screens — in one compact strip (no header row), so the
// Dashboard still fits on a desktop screen without scrolling. `content` and `screenCount` come from the
// Dashboard's own data.
function LimitsPanel({ content, screenCount }) {
  const images = content.filter((c) => c.type === "image").length;
  const videoBytes = content
    .filter((c) => c.type === "video")
    .reduce((sum, c) => sum + (c.sizeBytes || 0), 0);

  return (
    <div
      aria-label="Usage and limits"
      className="bg-bg-panel border border-border-muted rounded-xl px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
    >
        <LimitRow
          label="Images"
          used={images}
          max={MAX_IMAGES}
          usedText={images}
          maxText={MAX_IMAGES}
        />
        <LimitRow
          label="Video storage"
          used={videoBytes}
          max={MAX_VIDEO_BYTES}
          usedText={formatMB(videoBytes)}
          maxText={formatMB(MAX_VIDEO_BYTES)}
        />
        <LimitRow
          label="Screens"
          used={screenCount}
          max={MAX_SCREENS}
          usedText={screenCount}
          maxText={MAX_SCREENS}
        />
    </div>
  );
}

export default LimitsPanel;

// Used by: pages/Dashboard.jsx (bottom of the page, after Now playing).
