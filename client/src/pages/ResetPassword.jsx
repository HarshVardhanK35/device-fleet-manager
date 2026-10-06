import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, LockKeyhole, Eye, EyeOff, Check, Circle, X, Clock } from "lucide-react";

import { resetPassword } from "../api/auth.js";
import AuthLayout from "../components/AuthLayout.jsx";
import Button from "../components/Button.jsx";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const rules = [
    { text: "8+ characters", ok: password.length >= 8 },
    { text: "One number", ok: /\d/.test(password) },
    { text: "One uppercase letter", ok: /[A-Z]/.test(password) },
  ];

  const hasConfirm = confirmPassword.length > 0;
  const matches = hasConfirm && confirmPassword === password;
  const mismatches = hasConfirm && confirmPassword !== password;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mismatches) {
      setError("Passwords don't match");
      return;
    }

    const response = await resetPassword({ token, newPassword: password });

    if (response.message && response.message !== "Password reset successfully") {
      setError(response.message);
      return;
    }

    navigate("/login");
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <span className="w-11 h-11 rounded-xl bg-accent-blue/10 border border-accent-blue/25 text-accent-blue flex items-center justify-center">
          <LockKeyhole size={22} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-[26px] font-medium tracking-tight text-text-primary m-0">
            Set a new password
          </h1>
          <p className="text-text-muted m-0 text-pretty">
            Choose a strong password you haven't used before.
          </p>
        </div>

        {error && (
          <div className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg bg-accent-amber/10 border border-accent-amber/35 text-[13px] text-accent-amber">
            <Clock size={17} className="flex-none mt-0.5" />
            <span>
              {error}{" "}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="font-medium underline"
              >
                Request a new one
              </button>
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="rs-pw"
              className="text-[13px] font-medium text-text-primary/80"
            >
              New password
            </label>
            <div className="relative flex items-center">
              <Lock
                size={16}
                className="absolute left-3 text-text-muted pointer-events-none"
              />
              <input
                id="rs-pw"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                autoComplete="new-password"
                required
                className="w-full h-10 pl-10 pr-11 bg-bg-panel border border-border-muted rounded-lg text-text-primary text-sm outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-1 w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="rs-pw2"
              className="text-[13px] font-medium text-text-primary/80"
            >
              Confirm new password
            </label>
            <div className="relative flex items-center">
              <Lock
                size={16}
                className="absolute left-3 text-text-muted pointer-events-none"
              />
              <input
                id="rs-pw2"
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                required
                className={`w-full h-10 pl-10 pr-11 bg-bg-panel border rounded-lg text-text-primary text-sm outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue/20 ${
                  mismatches
                    ? "border-accent-red"
                    : matches
                      ? "border-accent-green"
                      : "border-border-muted"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-1 w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover"
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {(matches || mismatches) && (
              <span
                className={`flex items-center gap-1.5 text-xs ${
                  mismatches ? "text-accent-red" : "text-accent-green"
                }`}
              >
                {mismatches ? <X size={14} /> : <Check size={14} />}
                {mismatches ? "Passwords don't match" : "Passwords match"}
              </span>
            )}
          </div>

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
        </div>

        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
