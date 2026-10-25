import { useState } from "react";

// A labeled range slider showing its current value inline (e.g. "Size  9",
// "Opacity  60%"). Generic over any numeric range field — first used by
// rss-modal.jsx's brand-logo Size/Opacity controls. The value itself is
// click-to-edit — click it to type an exact number instead of only being
// able to drag the slider.
function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "" }) {
  const [editing, setEditing] = useState(false);

  function commit(raw) {
    const num = Number(raw);
    if (!Number.isNaN(num)) onChange(Math.min(max, Math.max(min, num)));
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-text-primary text-sm font-medium">{label}</span>
        {editing ? (
          <input
            autoFocus
            type="number"
            min={min}
            max={max}
            step={step}
            defaultValue={value}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(e.target.value);
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-12 bg-transparent border-none outline-none text-text-primary text-xs text-right"
          />
        ) : (
          <button
            type="button"
            title="Click to enter an exact value"
            onClick={() => setEditing(true)}
            className="bg-transparent border-0 border-b border-solid border-transparent text-text-muted text-xs hover:text-text-primary hover:border-accent-blue transition-colors"
          >
            {String(value).padStart(2, "0")}
            {suffix}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent-blue"
      />
    </div>
  );
}

export default SliderField;
