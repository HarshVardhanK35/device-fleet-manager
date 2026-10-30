import { Lightbulb } from "lucide-react";

// A short "what this does" line — bulb icon + muted text. `dim` fades it
// further while the setting it explains is disabled (e.g. Reduce motion
// suppressing an animation toggle), so the hint doesn't read louder than
// the control it's attached to. Template-agnostic — lives in common/ since
// Status List and Event Cards' own settings screens will want it too, not
// just Rotating Notices.
function Hint({ text, dim }) {
  return (
    <div className={`flex items-start gap-1.5 ${dim ? "opacity-50" : ""}`}>
      <Lightbulb size={12} className="text-text-muted flex-none mt-0.5" />
      <span className="text-[11px] text-text-muted">{text}</span>
    </div>
  );
}

export default Hint;

// Used by: RotatingNoticesSettings's BoardsSection.jsx, AttentionSection.jsx.
