import { useEffect, useRef, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck, CircleAlert, MonitorPlay } from "lucide-react";

import { verifyEmail } from "../api/auth.js";
import Button from "../components/Button.jsx";

function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const navigate = useNavigate();

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function run() {
      const response = await verifyEmail(token);
      if (response.message === "Email verified successfully") {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(response.message || "Verification failed");
      }
    }
    run();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-5">
      <div className="w-full max-w-[380px] flex flex-col items-center text-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-accent-blue flex items-center justify-center text-white flex-none">
            <MonitorPlay size={18} />
          </span>
          <span className="font-semibold text-sm text-text-primary">
            Device Fleet Manager
          </span>
        </div>

        {status === "loading" && (
          <p className="text-text-muted">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <span className="w-14 h-14 rounded-full bg-accent-green/10 border border-accent-green/35 text-accent-green flex items-center justify-center">
              <CircleCheck size={28} />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-medium text-text-primary m-0">
                Email verified
              </h1>
              <p className="text-text-muted m-0">
                You can now sign in to your account.
              </p>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <span className="w-14 h-14 rounded-full bg-accent-red/10 border border-accent-red/35 text-accent-red flex items-center justify-center">
              <CircleAlert size={28} />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-medium text-text-primary m-0">
                Verification failed
              </h1>
              <p className="text-text-muted m-0">{message}</p>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full">
              Back to login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

// nothing repeated
