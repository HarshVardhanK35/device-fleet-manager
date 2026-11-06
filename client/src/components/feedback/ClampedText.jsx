import { useEffect, useRef, useState } from "react";

// Text that is cut to a few lines (or one line) in a list. When it really is
// cut:
//   - a hover tooltip (the native `title`) shows the whole text on desktop;
//   - with `readMore`, touch screens (no hover) get a small "Read more" under it,
//     so people know the card opens to the full text.
// Whether it is cut is measured, so short messages show neither.
function ClampedText({ text, as: Tag = "p", className = "", readMore = false }) {
  const ref = useRef(null);
  const [cut, setCut] = useState(false);

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
        {text}
      </Tag>
      {readMore && cut && (
        <span className="hidden text-xs font-medium text-[#4493f8] [@media(hover:none)]:block">Read more</span>
      )}
    </>
  );
}

export default ClampedText;

// Used by: pages/Feedback.jsx, pages/AdminInbox.jsx.
