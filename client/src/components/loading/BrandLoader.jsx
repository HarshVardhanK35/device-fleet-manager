import { useId } from "react";

const FLAT = { white: "#ffffff", dark: "#0d1117" };

// The CastWise loading mark (Orbit design): the ring grows from a single point,
// wraps the TV and phone, then collapses back to a point a little further
// round each time, while the whole ring turns; the TV and phone pulse in turn
// (keyframes in index.css). It keeps moving even when the OS asks for reduced
// motion (Windows with animation effects off reports that), because a loading
// indicator is essential feedback. `tone`: "gradient"
// (blue to green), "white" or "dark". `size` is a number (px) or any CSS length. Pass `label={null}` when it sits inside a button that already
// says what is happening, so screen readers don't hear it twice.
// Used by: LoadingOverlay.jsx, pages/Screens.jsx, pages/Player.jsx and the app
// preview / playback frames (apps/shared/preview/AppPreviewFrame.jsx, AppRenderer.jsx).
function BrandLoader({ size = 24, tone = "gradient", label = "Loading", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `bl-g-${uid}`;
  const maskId = `bl-m-${uid}`;
  const paint = tone === "gradient" ? `url(#${gradientId})` : FLAT[tone];

  return (
    <svg
      className={className}
      style={{ width: size, height: size }}
      viewBox="0 0 64 64"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        {tone === "gradient" && (
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="6" y1="6" x2="58" y2="58">
            <stop offset="0" stopColor="#1f6feb" />
            <stop offset="1" stopColor="#3fb950" />
          </linearGradient>
        )}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <rect x="31" y="24" width="17" height="22" rx="6.5" fill="#000" />
        </mask>
      </defs>
      <g className="bl-spin">
        <circle className="bl-ring" cx="32" cy="32" r="24" fill="none" stroke={paint} strokeWidth="8" strokeLinecap="round" />
      </g>
      <rect className="bl-tv" x="19" y="21" width="20" height="14" rx="4" fill={paint} mask={`url(#${maskId})`} />
      <rect className="bl-phone" x="34" y="27" width="11" height="16" rx="3.5" fill={paint} />
    </svg>
  );
}

export default BrandLoader;
