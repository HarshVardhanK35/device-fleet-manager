import { Check, X } from "lucide-react";

function PasswordMatchHint({ matches, mismatches }) {
  if (!matches && !mismatches) return null;

  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${
        mismatches ? "text-accent-red" : "text-accent-green"
      }`}
    >
      {mismatches ? <X size={14} /> : <Check size={14} />}
      {mismatches ? "Passwords don't match" : "Passwords match"}
    </span>
  );
}

export default PasswordMatchHint;

// Live "Passwords match"/"Passwords don't match" indicator under the
// confirm-password field — was duplicated identically in Register.jsx and
// ResetPassword.jsx.
// Used by: pages/Register.jsx, pages/ResetPassword.jsx.
