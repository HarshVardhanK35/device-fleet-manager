import { useEffect, useState } from "react";

import BrandLoader from "./BrandLoader.jsx";

// What shows while a lazily loaded page downloads. It waits 200 ms before
// appearing, so a cached or quick page never flashes it. `fullScreen` for pages
// without the app shell (sign in, landing, pairing); otherwise it fills the
// content area and the side navbar stays visible.
// Used by: App.jsx (Suspense fallbacks).
function RouteFallback({ fullScreen = false }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className={`${fullScreen ? "fixed inset-0" : "min-h-[50vh]"} grid place-items-center`}>
      <BrandLoader size={fullScreen ? 72 : 48} label="Loading page" />
    </div>
  );
}

export default RouteFallback;
