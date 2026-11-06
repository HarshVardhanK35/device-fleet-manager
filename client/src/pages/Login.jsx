import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, CircleAlert, Clock } from "lucide-react";

import { login as loginApi, resendVerification } from "../api/auth.js";
import { useAuth } from "../context/useAuth.js";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthField from "../components/auth/AuthField.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import AuthErrorBanner from "../components/auth/AuthErrorBanner.jsx";
import AuthHeading from "../components/auth/AuthHeading.jsx";
import Button from "../components/ui/Button.jsx";
import LoadingOverlay from "../components/loading/LoadingOverlay.jsx";
import { useAsyncAction } from "../hooks/useAsyncAction.js";
import { takeReturnTo } from "../utils/sessionExpiry.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  // apiClient.js sends an ended session here with ?expired=1
  const [expired] = useState(() => new URLSearchParams(window.location.search).get("expired") === "1");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  // Explicitly navigating to /login while already logged in logs you out
  // — this page is the one place the user shouldn't still be authenticated.
  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [signIn, signingIn] = useAsyncAction(async () => {
    const response = await loginApi({ email, password });

    if (response.token) {
      login(response.token, response.user);
      navigate(takeReturnTo(location.state?.from));
    } else {
      setError(response.message || "Login failed");
    }
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResent(false);
    signIn();
  }

  async function handleResend() {
    const response = await resendVerification({ email });
    if (response.message === "Verification email resent") {
      setResent(true);
    } else {
      setError(response.message || "Failed to resend verification email");
    }
  }

  const unverified = error.toLowerCase().includes("verify");

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthHeading
          title="Sign in"
          subtitle="Welcome back. Enter your details to access your screens."
        />

        {expired && !error && (
          <AuthErrorBanner icon={Clock} tone="amber">
            You were signed out because your session ended. Sign in to continue.
          </AuthErrorBanner>
        )}

        {error && (
          <AuthErrorBanner icon={CircleAlert}>
            {error}
            {unverified && (
              <>
                {" "}
                {resent ? (
                  <span className="font-medium">
                    Verification email resent.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-medium underline"
                  >
                    Resend verification email
                  </button>
                )}
              </>
            )}
          </AuthErrorBanner>
        )}

        <div className="flex flex-col gap-4">
          <AuthField
            id="li-email"
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />

          <PasswordField
            id="li-pw"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            labelRight={
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[13px] font-medium text-accent-blue hover:underline"
              >
                Forgot password?
              </button>
            }
          />
        </div>

        <Button type="submit" className="w-full" disabled={signingIn}>
          {signingIn ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-text-muted text-[13px] m-0">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-medium text-accent-blue hover:underline"
          >
            Register
          </button>
        </p>
      </form>
      <LoadingOverlay show={signingIn} />
    </AuthLayout>
  );
}

export default Login;
