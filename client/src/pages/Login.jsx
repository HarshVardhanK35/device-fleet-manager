import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, CircleAlert } from "lucide-react";

import { login, resendVerification } from "../api/auth.js";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import Button from "../components/Button.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResent(false);

    const response = await login({ email, password });

    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
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
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-[26px] font-medium tracking-tight text-text-primary m-0">
            Sign in
          </h1>
          <p className="text-text-muted m-0">
            Welcome back. Enter your details to access your fleet.
          </p>
        </div>

        {error && (
          <div className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg bg-accent-red/10 border border-accent-red/35 text-[13px] text-accent-red">
            <CircleAlert size={17} className="flex-none mt-0.5" />
            <span>
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
            </span>
          </div>
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

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <label
                htmlFor="li-pw"
                className="text-[13px] font-medium text-text-primary/80"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[13px] font-medium text-accent-blue hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock
                size={16}
                className="absolute left-3 text-text-muted pointer-events-none"
              />
              <input
                id="li-pw"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
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
