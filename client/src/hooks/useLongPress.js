import { useRef } from "react";

// Touch long press (a finger held ~500ms without moving). Mouse presses are
// ignored — desktop has hover and a checkbox instead. Spread `handlers` onto
// the element; call `consumeClick()` first thing in its onClick — it returns
// true (once) when that click is just the tail of a long press and must be
// swallowed. Moving more than 10px cancels the press, so scrolling a list
// never selects anything. The browser's own long-press menu is suppressed.
export function useLongPress(onLongPress, ms = 500) {
  const timer = useRef(null);
  const start = useRef(null);
  const fired = useRef(false);

  function clear() {
    clearTimeout(timer.current);
    timer.current = null;
  }

  const handlers = {
    onPointerDown(e) {
      if (!onLongPress || e.pointerType === "mouse") return;
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      clear();
      timer.current = setTimeout(() => {
        fired.current = true;
        navigator.vibrate?.(15);
        onLongPress();
      }, ms);
    },
    onPointerMove(e) {
      if (!timer.current || !start.current) return;
      if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) clear();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    onContextMenu(e) {
      if (onLongPress) e.preventDefault();
    },
  };

  function consumeClick() {
    if (!fired.current) return false;
    fired.current = false;
    return true;
  }

  return { handlers, consumeClick };
}

// Used by: components/PlaylistRow.jsx, components/SelectableContentTile.jsx.
