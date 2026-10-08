import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

function ScrollToTopButton({ scrollRef, threshold = 150 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      setVisible(el.scrollTop > threshold);
    }
    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollRef, threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="absolute bottom-24 md:bottom-5 right-5 w-10 h-10 rounded-full bg-[#1f6feb] border border-accent-blue hover:bg-[#1a5fd0] text-white shadow-[0_4px_16px_rgba(1,4,9,0.5)] flex items-center justify-center transition-colors active:scale-[0.92] z-20"
    >
      <ChevronUp size={20} />
    </button>
  );
}

export default ScrollToTopButton;

// Floating "back to top" button for a long scrollable list. Pass the same
// ref given to a ScrollBox's `ref` prop (its Viewport DOM node) as
// `scrollRef` — shows itself once that element has scrolled past
// `threshold` px (default 150) and smooth-scrolls it back to 0 on click.
// Render it as a sibling of the ScrollBox inside a `relative` wrapper, so
// its `absolute` positioning stays scoped to that scroll area rather than
// the whole viewport.
// Used by: pages/Content.jsx.
