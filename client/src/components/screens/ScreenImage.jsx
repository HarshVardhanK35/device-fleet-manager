import { useEffect, useState } from "react";

// Shows an image only once it has fully loaded and decoded, so it appears
// whole instead of painting from top to bottom; the previous image stays up
// until then. A short fade makes the swap soft.
function ScreenImage({ url, alt }) {
  const [shown, setShown] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = url;
    const ready = img.decode ? img.decode() : Promise.resolve();
    ready
      .catch(() => {})
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
      style={{ width: "100vw", height: "100vh", objectFit: "cover", animation: "cw-fade 400ms ease-out both" }}
    />
  );
}

export default ScreenImage;

// Used by: components/screens/DevicePlayback.jsx.
