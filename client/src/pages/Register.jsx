import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CircleAlert } from "lucide-react";

import { register } from "../api/auth.js";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import AuthEmailSentModal from "../components/AuthEmailSentModal.jsx";
import AuthErrorBanner from "../components/AuthErrorBanner.jsx";
import AuthHeading from "../components/AuthHeading.jsx";
import PasswordField from "../components/PasswordField.jsx";
import PasswordRequirementsList from "../components/PasswordRequirementsList.jsx";
import PasswordMatchHint from "../components/PasswordMatchHint.jsx";
import Button from "../components/Button.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import { getPasswordRules } from "../utils/passwordRules.js";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    const response = await register({ firstName, lastName, email, password });
    setLoading(false);

    if (response.message) {
      setError(response.message);
      return;
    }

    setModalOpen(true);
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthHeading
          title="Create your account"
          subtitle="Start managing your screens in a few minutes."
        />

        {error && <AuthErrorBanner icon={CircleAlert}>{error}</AuthErrorBanner>}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthField
              id="rg-fn"
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              autoComplete="given-name"
            />
            <AuthField
              id="rg-ln"
              label="Last name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Morgan"
              autoComplete="family-name"
              required={false}
            />
          </div>

          <AuthField
            id="rg-email"
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />

          <div className="flex flex-col gap-1.5">
            <PasswordField
              id="rg-pw"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            <PasswordRequirementsList rules={rules} variant="inline" />
          </div>

          <div className="flex flex-col gap-1.5">
            <PasswordField
              id="rg-pw2"
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              tone={mismatches ? "mismatch" : matches ? "match" : "default"}
            />
            <PasswordMatchHint matches={matches} mismatches={mismatches} />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          Create account
        </Button>

        <p className="text-center text-text-muted text-[13px] m-0">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-accent-blue hover:underline"
          >
            Login
          </button>
        </p>
      </form>

      <AuthEmailSentModal
        open={modalOpen}
        email={email}
        variant="verify"
        onClose={() => navigate("/login")}
      />
      <LoadingOverlay show={loading} />
    </AuthLayout>
  );
}

export default Register;
