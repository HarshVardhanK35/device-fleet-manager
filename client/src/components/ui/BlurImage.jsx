import { useState } from "react";

import { getBlurPlaceholder, getOptimizedThumbnail } from "../../utils/cloudinaryTransform.js";

// A picture that loads "blur-up": a tiny blurred copy (about 1 kB) fills the
// box at once, then the real image fades in over it when it has arrived, so
// there is no line-by-line draw and no empty box. With fit="contain" the
// blurred copy also stays behind the picture and fills the bars at its sides.
// `url` is the original (Cloudinary) address; `width` picks the resized copy.
// Must sit inside a positioned (relative) box: it fills it. Lazy-loaded.
// Used by: content/ContentTile.jsx, content/ContentPickerModal.jsx,
// content/ContentDetailsPanel.jsx, screens/ScreenThumb.jsx.
function BlurImage({ url, width = 400, alt = "", fit = "cover" }) {
  const [loaded, setLoaded] = useState(false);
  const placeholder = getBlurPlaceholder(url);

  return (
    <>
      {placeholder && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      <img
        // A picture that is already cached never fires onLoad after mount.
        ref={(el) => {
          if (el && !loaded && el.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        src={getOptimizedThumbnail(url, width)}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
          fit === "contain" ? "object-contain" : "object-cover"
        } ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

export default BlurImage;
