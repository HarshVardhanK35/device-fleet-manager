import { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "../../hooks/useCompactLayout.js";

// Text that is cut to a few lines (or one line) in a list. When it really is
// cut:
//   - a hover tooltip (the native `title`) shows the whole text on desktop;
//   - with `readMore`, touch screens (no hover) get a small "Read more" right after the
//     ellipsis on the last line, so people know the card opens to the full text. It is two
//     right floats at the start of the text: an empty one as tall as the first line pushes the
//     "Read more" float down beside the last line, so the last line is shortened to leave it room.
// Whether it is cut is measured, so short messages show neither.
function ClampedText({ text, as: Tag = "p", className = "", readMore = false }) {
  const ref = useRef(null);
  const [cut, setCut] = useState(false);
  const touch = useMediaQuery("(hover: none)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    // The observer reports once when it starts, then on every resize.
    const observer = new ResizeObserver(() => {
      setCut(el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <>
      <Tag ref={ref} title={cut ? text : undefined} className={className}>
        {readMore && cut && touch && (
          <>
            <span aria-hidden className="float-right h-[1.5em] w-0" />
            <span className="float-right clear-right pl-1 text-xs font-medium text-[#4493f8]">Read more</span>
          </>
        )}
        {text}
      </Tag>
    </>
  );
}

export default ClampedText;

// Used by: pages/Feedback.jsx, pages/AdminInbox.jsx.
