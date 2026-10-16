// A small label-above-input wrapper. Keeps every settings field's label
// styled the same way, instead of each one hand-rolling its own <span>.
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-text-muted text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}

export default Field;
