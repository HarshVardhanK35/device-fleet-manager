import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

// `tone` drives the border color: "default" | "match" (green) | "mismatch"
// (red) — used for the confirm-password field's live match indicator.
// `labelRight` renders next to the label (Login's "Forgot password?" link).
function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  tone = "default",
  labelRight,
}) {
  const [show, setShow] = useState(false);

  const toneClass =
    tone === "mismatch"
      ? "border-accent-red"
      : tone === "match"
        ? "border-accent-green"
        : "border-border-muted";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-text-primary/80"
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative flex items-center">
        <Lock
          size={16}
          className="absolute left-3 text-text-muted pointer-events-none"
        />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full h-10 pl-10 pr-11 bg-bg-panel border rounded-lg text-text-primary text-sm outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue/20 ${toneClass}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label="Toggle password visibility"
          className="absolute right-1 w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;

// Password input with its own show/hide eye toggle — this exact block (icon
// + input + eye button, same classes) was duplicated 5 times: Login
// (password), Register (password + confirm), ResetPassword (password +
// confirm).
// Used by: pages/Login.jsx, pages/Register.jsx, pages/ResetPassword.jsx.
