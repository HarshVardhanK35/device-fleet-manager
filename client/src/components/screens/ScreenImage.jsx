import { useEffect, useState } from "react";

import { logError, logEvent, logWarn } from "../../utils/screenLog/screenLog.js";

// Shows an image only once it has fully loaded and decoded, so it appears
// whole instead of painting from top to bottom; the previous image stays up
// until then. A short fade makes the swap soft. `fit` is "cover" (fills the screen,
// crops the edges) or "contain" (the whole picture, with bars).
function ScreenImage({ url, alt, fit = "cover", onFailed }) {
  const [shown, setShown] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = url;
    const began = Date.now();
    const ready = img.decode ? img.decode() : Promise.resolve();
    ready
      .then(() => logEvent("image", `Image ready to show (${Date.now() - began} ms): ${url.slice(-70)}`))
      .catch((error) => logWarn("image", `Image could not be decoded (${error.name}: ${error.message}); showing it anyway: ${url.slice(-70)}`))
      .then(() => {
        if (!cancelled) setShown(url);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!shown) return null;
  return (
    <img
      key={shown}
      src={shown}
      alt={alt}
      onError={() => {
        logError("image", `The image failed to load (offline and not saved?): ${shown.slice(-70)}`);
        if (onFailed) onFailed();
      }}
      style={{ width: "100vw", height: "100vh", objectFit: fit, animation: "cw-fade 400ms ease-out both" }}
    />
  );
}

export default ScreenImage;

// Used by: components/screens/DevicePlayback.jsx.
