import { Check, Minus } from "lucide-react";

function SelectCheckbox({
  checked,
  indeterminate = false,
  onClick,
  shape = "square",
  alwaysVisible = false,
  className = "",
}) {
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded";

  if (shape === "circle") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-[18px] h-[18px] ${shapeClass} flex items-center justify-center border-[1.5px] border-accent-blue shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-opacity ${
          checked
            ? "bg-accent-blue opacity-100"
            : "bg-white/95 opacity-0 group-hover:opacity-100"
        } ${className}`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[18px] h-[18px] ${shapeClass} flex items-center justify-center border-[1.5px] transition-colors ${
        checked
          ? "bg-accent-blue border-accent-blue opacity-100"
          : `bg-black/50 border-white/80 hover:border-white ${alwaysVisible ? "" : "opacity-0 group-hover:opacity-100"}`
      } ${className}`}
    >
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      {indeterminate && !checked && (
        <Minus size={12} className="text-white" strokeWidth={3} />
      )}
    </button>
  );
}

export default SelectCheckbox;

// Shared tile/row select-toggle checkbox. `shape="square"` (default) is the
// hover-reveal content-library style (black translucent bg, white border);
// `shape="circle"` is the content-picker style (always-visible blue-ringed
// circle). `onClick` should call `e.stopPropagation()` itself if nested
// inside a clickable parent (it isn't done here, since callers' click
// semantics differ). `alwaysVisible` skips the opacity-0/group-hover reveal
// (e.g. for a standalone "select all" checkbox, not inside a `group` tile).
// `indeterminate` renders a dash instead of a check for partial selection.
// Used by: pages/Content.jsx, components/ContentPickerModal.jsx.
