// A labeled range slider showing its current value inline (e.g. "Size  9",
// "Opacity  60%"). Generic over any numeric range field — first used by
// rss-modal.jsx's brand-logo Size/Opacity controls.
function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-text-primary text-sm font-medium">{label}</span>
        <span className="text-text-muted text-xs">
          {value}
          {suffix}
        </span>
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
