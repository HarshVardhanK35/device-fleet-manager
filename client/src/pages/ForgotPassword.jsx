import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Key, ArrowLeft, CircleAlert } from "lucide-react";

import { forgotPassword } from "../api/auth.js";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import AuthEmailSentModal from "../components/AuthEmailSentModal.jsx";
import Button from "../components/Button.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    setLoading(true);
    const response = await forgotPassword({ email });
    setLoading(false);

    if (response.message && response.message !== "Password reset link sent") {
      setError(response.message);
      return;
    }

    setModalOpen(true);
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <span className="w-11 h-11 rounded-xl bg-accent-blue/10 border border-accent-blue/25 text-accent-blue flex items-center justify-center">
          <Key size={22} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-[26px] font-medium tracking-tight text-text-primary m-0">
            Forgot your password?
          </h1>
          <p className="text-text-muted m-0 text-pretty">
            Enter the email linked to your account and we'll send you a reset
            link.
          </p>
        </div>

        {error && (
          <div className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg bg-accent-red/10 border border-accent-red/35 text-[13px] text-accent-red">
            <CircleAlert size={17} className="flex-none mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <AuthField
          id="fp-email"
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          Send reset link
        </Button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="self-center flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-primary hover:bg-bg-hover px-1.5 py-1 rounded-md"
        >
          <ArrowLeft size={15} />
          Back to login
        </button>
      </form>

      <AuthEmailSentModal
        open={modalOpen}
        email={email}
        variant="reset"
        onClose={() => navigate("/login")}
      />
      <LoadingOverlay show={loading} />
    </AuthLayout>
  );
}

export default ForgotPassword;
