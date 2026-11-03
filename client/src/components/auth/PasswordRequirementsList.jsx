import { Check, Circle } from "lucide-react";

// "inline" (small chips in a wrapping row, under the password field itself —
// Register) vs "boxed" (bordered panel with a heading — ResetPassword).
function PasswordRequirementsList({ rules, variant = "inline" }) {
  if (variant === "boxed") {
    return (
      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-bg-panel border border-border-muted">
        <span className="text-xs font-medium text-text-muted">
          Your password must have
        </span>
        {rules.map((r) => (
          <span
            key={r.text}
            className={`flex items-center gap-2 text-[13px] ${
              r.ok ? "text-accent-green" : "text-text-muted"
            }`}
          >
            {r.ok ? <Check size={15} /> : <Circle size={15} />}
            {r.text}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-0.5">
      {rules.map((r) => (
        <span
          key={r.text}
          className={`flex items-center gap-1 text-xs ${
            r.ok ? "text-accent-green" : "text-text-muted"
          }`}
        >
          {r.ok ? <Check size={14} /> : <Circle size={14} />}
          {r.text}
        </span>
      ))}
    </div>
  );
}

export default PasswordRequirementsList;

// Renders the password-rule checklist built by utils/passwordRules.js's
// getPasswordRules(). Was duplicated (array + render) identically in
// Register.jsx ("inline" layout) and ResetPassword.jsx ("boxed" layout).
// Used by: pages/Register.jsx, pages/ResetPassword.jsx.
