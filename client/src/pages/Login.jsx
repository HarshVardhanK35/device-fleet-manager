import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CircleAlert } from "lucide-react";

import { login as loginApi, resendVerification } from "../api/auth.js";
import { useAuth } from "../context/useAuth.js";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import AuthErrorBanner from "../components/AuthErrorBanner.jsx";
import AuthHeading from "../components/AuthHeading.jsx";
import Button from "../components/Button.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  // Explicitly navigating to /login while already logged in logs you out
  // — this page is the one place the user shouldn't still be authenticated.
  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResent(false);

    const response = await loginApi({ email, password });

    if (response.token) {
      login(response.token, response.user);
      navigate("/");
    } else {
      setError(response.message || "Login failed");
    }
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
          subtitle="Welcome back. Enter your details to access your fleet."
        />

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

        <Button type="submit" className="w-full">
          Sign in
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
    </AuthLayout>
  );
}

export default Login;
