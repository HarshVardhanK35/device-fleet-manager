function AuthField({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  required = true,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-text-primary/80">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 text-text-muted pointer-events-none"
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full h-10 ${Icon ? "pl-10" : "pl-3"} pr-3 bg-bg-panel border ${
            error ? "border-accent-red" : "border-border-muted"
          } rounded-lg text-text-primary text-sm outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue/20`}
        />
      </div>
    </div>
  );
}

export default AuthField;

// Shared labeled text input for the auth pages (Login/Register/Forgot/
// Reset) — plain field with an optional leading icon. Password fields
// with a show/hide toggle button are NOT built with this (they need the
// extra absolutely-positioned button on the right), those are hand-rolled
// inline in each form.
// Used by: pages/Login.jsx, pages/Register.jsx, pages/ForgotPassword.jsx.
