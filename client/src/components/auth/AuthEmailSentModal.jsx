import { createPortal } from "react-dom";
import { MailOpen, Check } from "lucide-react";

function AuthEmailSentModal({ open, email, variant = "verify", onClose }) {
  if (!open) return null;

  const lead =
    variant === "verify"
      ? "We've sent a verification link to"
      : "We've sent a password reset link to";
  const tail =
    variant === "verify"
      ? "Open it to activate your account."
      : "It expires in 1 hour.";

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-[360px] bg-bg-panel border border-border-muted rounded-2xl pt-7 pb-6 px-6 shadow-2xl flex flex-col items-center text-center gap-[18px]"
      >
        <div className="relative w-[60px] h-[60px] rounded-full bg-accent-green/10 border border-accent-green/35 flex items-center justify-center text-accent-green">
          <MailOpen size={28} />
          <span className="absolute -right-0.5 -bottom-0.5 w-[22px] h-[22px] rounded-full bg-accent-green border-[3px] border-bg-panel flex items-center justify-center text-[#10241a]">
            <Check size={11} strokeWidth={3} />
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 id="auth-modal-title" className="text-lg font-medium text-text-primary m-0">
            Check your inbox
          </h2>
          <p className="text-sm text-text-muted m-0 text-pretty">
            {lead} <span className="text-text-primary font-medium">{email}</span>.{" "}
            {tail}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-full rounded-lg bg-accent-blue text-white font-medium text-sm hover:bg-[#3b7ced] active:bg-[#2860c4]"
        >
          Okay
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default AuthEmailSentModal;

// "Check your inbox" success modal shown after Register (variant="verify")
// or Forgot Password (variant="reset") submission. Plain conditional
// render (not Radix Dialog) since it has no other dismissal path besides
// the "Okay" button — matches the mock exactly (closeModal just routes
// back to the login screen).
// Used by: pages/Register.jsx, pages/ForgotPassword.jsx.
