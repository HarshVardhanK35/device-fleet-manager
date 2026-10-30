// A row of buttons where exactly one is "selected" — e.g. Today/3-Day/7-Day,
// 12h/24h. `options` are the real values used in state (e.g. "C"/"F");
// `labelFor` (optional) lets the button show something different from the
// raw value, like adding a degree symbol, without changing what's actually
// stored in state.
function SegmentedControl({ options, value, onChange, labelFor, disabled = false, disabledOptions = [], titleFor }) {
  return (
    // A real 4px gap between buttons (not just a thin divider line) so each
    // one is a fully separate box — hovering one can never visually read as
    // touching its neighbor, no matter how close the colors are.
    <div className="flex gap-1 p-1 border border-border-muted rounded-lg">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled || disabledOptions.includes(opt)}
          title={titleFor ? titleFor(opt) : undefined}
          onClick={() => onChange(opt)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${
            value === opt
              ? "bg-accent-blue/15 text-accent-blue"
              : "text-text-primary hover:bg-bg-hover disabled:hover:bg-transparent"
          }`}
        >
          {labelFor ? labelFor(opt) : opt}
        </button>
      ))}
    </div>
  );
}

export default SegmentedControl;
