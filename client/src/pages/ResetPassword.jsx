import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole, Clock } from "lucide-react";

import { resetPassword } from "../api/auth.js";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthErrorBanner from "../components/AuthErrorBanner.jsx";
import AuthHeading from "../components/AuthHeading.jsx";
import PasswordField from "../components/PasswordField.jsx";
import PasswordRequirementsList from "../components/PasswordRequirementsList.jsx";
import PasswordMatchHint from "../components/PasswordMatchHint.jsx";
import Button from "../components/Button.jsx";
import { getPasswordRules } from "../utils/passwordRules.js";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const rules = getPasswordRules(password);

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
        <AuthHeading
          icon={LockKeyhole}
          title="Set a new password"
          subtitle="Choose a strong password you haven't used before."
        />

        {error && (
          <AuthErrorBanner icon={Clock} tone="amber">
            {error}{" "}
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="font-medium underline"
            >
              Request a new one
            </button>
          </AuthErrorBanner>
        )}

        <div className="flex flex-col gap-4">
          <PasswordField
            id="rs-pw"
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a new password"
            autoComplete="new-password"
          />

          <div className="flex flex-col gap-1.5">
            <PasswordField
              id="rs-pw2"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              tone={mismatches ? "mismatch" : matches ? "match" : "default"}
            />
            <PasswordMatchHint matches={matches} mismatches={mismatches} />
          </div>

          <PasswordRequirementsList rules={rules} variant="boxed" />
        </div>

        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
