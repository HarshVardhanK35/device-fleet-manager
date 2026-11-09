// `gap` on a flex layout needs Chromium 84; a TV browser from before that (a 2021
// Samsung runs Chromium 76) ignores it and the stage's boxes, icons and lines
// all touch. Where that is the case, installFlexGapFallback() turns every flex
// gap on the page into spacing on the children instead. A browser that supports
// it (checked once, below) gets none of this.

function supportsFlexGap() {
  const box = document.createElement("div");
  box.style.cssText = "display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden";
  box.appendChild(document.createElement("div"));
  box.appendChild(document.createElement("div"));
  document.body.appendChild(box);
  const supported = box.scrollHeight === 1;
  document.body.removeChild(box);
  return supported;
}

// Returns a cleanup function. `root` is the element whose flex layouts are fixed.
export function installFlexGapFallback(root) {
  if (supportsFlexGap()) return () => {};

  let queued = false;

  function apply() {
    queued = false;
    root.querySelectorAll("*").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display.indexOf("flex") === -1) return;
      const column = style.flexDirection.indexOf("column") === 0;
      const gap = parseFloat(column ? style.rowGap : style.columnGap) || 0;
      const side = column ? "marginTop" : "marginLeft";
      Array.prototype.forEach.call(el.children, (child, index) => {
        if (child.dataset.flexGapSkip) return;
        // remember the child's own margin the first time, so the gap is added to it
        if (child.dataset.flexGapBase === undefined) {
          // `margin: auto` pushes a child to the far end; it must stay automatic
          if (child.style[side] === "auto") {
            child.dataset.flexGapSkip = "1";
            return;
          }
          child.dataset.flexGapBase = String(parseFloat(getComputedStyle(child)[side]) || 0);
        }
        const base = parseFloat(child.dataset.flexGapBase);
        child.style[side] = `${index === 0 ? base : base + gap}px`;
      });
    });
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }

  window.addEventListener("resize", schedule);
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();

  return () => {
    window.removeEventListener("resize", schedule);
    observer.disconnect();
  };
}

// Used by: pages/Screens.jsx.
