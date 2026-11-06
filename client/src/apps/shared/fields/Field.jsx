// A small label-above-input wrapper. Keeps every settings field's label
// styled the same way, instead of each one hand-rolling its own <span>.
// Matches the inline toggle-row labels (e.g. "Multiple time zones", "Show
// date") in weight/color — a field's label is as important as a toggle's,
// not secondary helper text, so it shouldn't read dimmer than one.
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-text-primary text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export default Field;
