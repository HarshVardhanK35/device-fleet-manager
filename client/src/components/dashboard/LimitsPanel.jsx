import { MAX_IMAGES, MAX_VIDEO_BYTES, MAX_SCREENS, formatMB } from "../../utils/validation/limits.js";

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
      <div className="flex items-baseline justify-between gap-2 whitespace-nowrap">
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
// video and screens — in one compact strip under a small "Usage and limits"
// heading. `content` and `screenCount` come from the
// Dashboard's own data.
function LimitsPanel({ content, screenCount }) {
  const images = content.filter((c) => c.type === "image").length;
  const videoBytes = content
    .filter((c) => c.type === "video")
    .reduce((sum, c) => sum + (c.sizeBytes || 0), 0);

  return (
    <section
      aria-label="Usage and limits"
      className="bg-bg-panel border border-border-muted rounded-xl px-4 py-3 flex flex-col gap-3"
    >
      <h2 className="m-0 text-text-muted text-xs font-semibold uppercase tracking-wide">
        Usage and limits
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <LimitRow
          label="Images"
          used={images}
          max={MAX_IMAGES}
          usedText={images}
          maxText={MAX_IMAGES}
        />
        <LimitRow
          label="Video"
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
    </section>
  );
}

export default LimitsPanel;

// Used by: pages/Dashboard.jsx (bottom of the page, after Now playing).
