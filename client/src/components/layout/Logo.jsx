import { useId } from "react";

const FLAT = { white: "#ffffff", dark: "#0d1117" };

// The CastWise symbol (Orbit): an open ring around a TV and a phone. `size`
// is a number (px) or any CSS length; `tone` is "gradient", "white" or "dark".
// Geometry is from z-castwise-logo (64 x 64 grid).
// Used by: Layout.jsx, AuthLayout.jsx, Screens.jsx, VerifyEmail.jsx and the
// landing page (pages/landing/landingParts.jsx).
function Logo({ size = 28, tone = "gradient", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `lg-g-${uid}`;
  const maskId = `lg-m-${uid}`;
  const paint = tone === "gradient" ? `url(#${gradientId})` : FLAT[tone];

  return (
    <svg className={className} style={{ width: size, height: size }} viewBox="0 0 64 64" role="img" aria-label="CastWise">
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
      <path d="M55.64 27.83A24 24 0 1 1 36.17 8.36" fill="none" stroke={paint} strokeWidth="8" strokeLinecap="round" />
      <rect x="19" y="21" width="20" height="14" rx="4" fill={paint} mask={`url(#${maskId})`} />
      <rect x="34" y="27" width="11" height="16" rx="3.5" fill={paint} />
    </svg>
  );
}

export default Logo;
