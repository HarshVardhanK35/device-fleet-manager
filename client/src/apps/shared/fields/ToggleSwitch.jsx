// A simple on/off switch (not a native checkbox — styled to look like a
// real toggle). Used anywhere the app needs a yes/no setting: PublishModal's
// "Override", AppsPickerModal's "Available now", and app settings screens'
// "Theme" toggle all used to each have their own hand-copied version of
// this — now there's just one.
function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 flex-none ${disabled ? "cursor-not-allowed" : ""}`}
    >
      <span
        className={`w-9 h-5 rounded-full relative transition-colors ${
          checked ? "bg-accent-blue" : "bg-border-hover"
        } ${disabled ? "opacity-45" : ""}`}
      >
        {/* The knob moves by sliding 16px to the right when checked — done
            with a real transform instead of left/right positioning so the
            slide is a smooth animation, not a jump. */}
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
            checked ? "bg-white" : "bg-text-primary/90"
          }`}
          style={{ transform: `translateX(${checked ? 16 : 0}px)` }}
        />
      </span>
      {label && <span className="text-text-primary text-sm font-medium">{label}</span>}
    </button>
  );
}

export default ToggleSwitch;

// Used by: components/PublishModal.jsx (Override), apps/AppsPickerModal.jsx
// (Available now), apps/shared/* app settings screens (Theme toggle, etc).
