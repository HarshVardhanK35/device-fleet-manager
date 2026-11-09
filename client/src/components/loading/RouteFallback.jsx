import { useEffect, useState } from "react";

import BrandLoader from "./BrandLoader.jsx";

// What shows while a lazily loaded page downloads. It waits 200 ms before
// appearing, so a cached or quick page never flashes it. `fullScreen` for pages
// without the app shell (sign in, landing, pairing); otherwise it fills the
// content area and the side navbar stays visible.
// Used by: App.jsx (Suspense fallbacks).
// Plain inline styles, not Tailwind classes: this is the first thing /screens shows on a TV
// browser, which does not apply Tailwind's CSS (it needs Chromium 99), and the loader
// would otherwise sit in the top-left corner.
const FULL_SCREEN = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: "grid",
  placeItems: "center",
};
const INLINE = { minHeight: "50vh", display: "grid", placeItems: "center" };

function RouteFallback({ fullScreen = false }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div style={fullScreen ? FULL_SCREEN : INLINE}>
      <BrandLoader size={fullScreen ? 72 : 48} label="Loading page" />
    </div>
  );
}

export default RouteFallback;
