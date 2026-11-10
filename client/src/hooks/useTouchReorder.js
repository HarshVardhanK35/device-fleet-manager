import { useCallback, useEffect, useRef, useState } from "react";

// Reordering the items of a playlist with a finger: hold an item for about a third of a second
// (it lifts and the phone buzzes), then drag it over another item and let go to drop it there.
// Holding and letting go without moving still selects the item, as a long press always did.
// A finger that moves before the hold is a scroll, so scrolling a list never moves anything.
// The list scrolls by itself while an item is dragged near its top or bottom edge. A mouse is
// ignored: desktop drags with the browser's own drag and drop.
//
//   const reorder = useTouchReorder({ enabled, onMove(from, to), onSelect(index) });
//   spread reorder.bind(index) on each item; call reorder.consumeClick() first in its onClick
//   (true once when that click is only the end of a hold or a drop); reorder.armed / from / over
//   say which item is lifted, which is being dragged and which one it hovers over.

const HOLD_MS = 380;
const CANCEL_PX = 10; // moving this far before the hold is over is a scroll
const DRAG_PX = 8; // moving this far after it starts the drag
const EDGE_PX = 90; // near the top or bottom edge the list scrolls
const MAX_SCROLL = 16; // px per frame

// The nearest ancestor that scrolls, or null (then the page itself scrolls).
function scrollParentOf(element) {
  let node = element.parentElement;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

// The small label that follows the finger while an item is dragged.
function makeGhost(index, x, y) {
  const ghost = document.createElement("div");
  ghost.textContent = `Item ${index + 1}`;
  ghost.style.cssText =
    "position:fixed;left:0;top:0;z-index:200;pointer-events:none;padding:6px 12px;border-radius:999px;background:#1f6feb;color:#fff;font:600 13px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.5)";
  ghost.style.transform = `translate(${x + 12}px, ${y - 44}px)`;
  document.body.appendChild(ghost);
  return ghost;
}

export function useTouchReorder({ enabled, onMove, onSelect }) {
  const [state, setState] = useState({ armed: null, from: null, over: null });
  const gesture = useRef(null); // the press in progress, if any
  const swallow = useRef(false); // the next click is only the end of a hold or a drop
  const latest = useRef({ enabled, onMove, onSelect });

  useEffect(() => {
    latest.current = { enabled, onMove, onSelect };
  });

  const finish = useCallback(() => {
    const g = gesture.current;
    if (!g) return;
    clearTimeout(g.timer);
    cancelAnimationFrame(g.raf);
    window.removeEventListener("pointermove", g.onPointerMove);
    window.removeEventListener("pointerup", g.onPointerUp);
    window.removeEventListener("pointercancel", g.onPointerCancel);
    window.removeEventListener("touchmove", g.onTouchMove);
    if (g.ghost) g.ghost.remove();
    gesture.current = null;
    setState({ armed: null, from: null, over: null });
  }, []);

  useEffect(() => finish, [finish]);

  const begin = useCallback(
    (event, index) => {
      if (!latest.current.enabled || event.pointerType === "mouse" || gesture.current) return;
      if (event.target.closest("button, a, [role='menuitem']")) return;
      swallow.current = false;

      const tile = event.currentTarget;
      const g = {
        pointerId: event.pointerId,
        index,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        armed: false,
        dragging: false,
        over: null,
        scroller: null,
        ghost: null,
        raf: 0,
        timer: 0,
      };
      gesture.current = g;

      // the tile under the finger, if it is one of the items
      function hitTest() {
        for (const element of document.elementsFromPoint(g.x, g.y)) {
          const found = element.closest("[data-slot-index]");
          if (found) return Number(found.dataset.slotIndex);
        }
        return null;
      }
      function updateOver() {
        const over = hitTest();
        if (over === g.over) return;
        g.over = over;
        setState((current) => ({ ...current, over: over === g.index ? null : over }));
      }
      // scrolls the list while the finger is near its top or bottom edge
      function autoScroll() {
        if (gesture.current !== g || !g.dragging) return;
        const box = g.scroller ? g.scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
        let speed = 0;
        if (g.y < box.top + EDGE_PX) speed = -MAX_SCROLL * Math.min(1, (box.top + EDGE_PX - g.y) / EDGE_PX);
        else if (g.y > box.bottom - EDGE_PX) speed = MAX_SCROLL * Math.min(1, (g.y - (box.bottom - EDGE_PX)) / EDGE_PX);
        if (speed) {
          if (g.scroller) g.scroller.scrollTop += speed;
          else window.scrollBy(0, speed);
          updateOver();
        }
        g.raf = requestAnimationFrame(autoScroll);
      }

      g.timer = setTimeout(() => {
        g.armed = true;
        navigator.vibrate?.(15);
        setState({ armed: index, from: null, over: null });
      }, HOLD_MS);

      g.onPointerMove = (move) => {
        if (move.pointerId !== g.pointerId) return;
        g.x = move.clientX;
        g.y = move.clientY;
        const distance = Math.hypot(move.clientX - g.startX, move.clientY - g.startY);
        if (!g.armed) {
          if (distance > CANCEL_PX) finish(); // a scroll
          return;
        }
        if (!g.dragging && distance > DRAG_PX) {
          g.dragging = true;
          g.scroller = scrollParentOf(tile);
          g.ghost = makeGhost(index, move.clientX, move.clientY);
          setState({ armed: null, from: index, over: null });
          g.raf = requestAnimationFrame(autoScroll);
        }
        if (g.dragging) {
          g.ghost.style.transform = `translate(${move.clientX + 12}px, ${move.clientY - 44}px)`;
          updateOver();
        }
      };

      g.onPointerUp = (up) => {
        if (up.pointerId !== g.pointerId) return;
        const { armed, dragging, over } = g;
        finish();
        if (dragging) {
          swallow.current = true;
          if (over !== null && over !== index) latest.current.onMove(index, over);
        } else if (armed) {
          swallow.current = true;
          latest.current.onSelect(index);
        }
      };

      g.onPointerCancel = () => finish();

      // once the item is lifted the page must not scroll under the finger
      g.onTouchMove = (move) => {
        if (g.armed) move.preventDefault();
      };

      window.addEventListener("pointermove", g.onPointerMove);
      window.addEventListener("pointerup", g.onPointerUp);
      window.addEventListener("pointercancel", g.onPointerCancel);
      window.addEventListener("touchmove", g.onTouchMove, { passive: false });
    },
    [finish],
  );

  const bind = (index) => ({
    "data-slot-index": index,
    onPointerDown: (event) => begin(event, index),
    onContextMenu: (event) => {
      if (latest.current.enabled) event.preventDefault();
    },
  });

  const consumeClick = () => {
    if (!swallow.current) return false;
    swallow.current = false;
    return true;
  };

  return { bind, consumeClick, armed: state.armed, from: state.from, over: state.over };
}

// Used by: components/playlists/PlaylistSlotGrid.jsx.
