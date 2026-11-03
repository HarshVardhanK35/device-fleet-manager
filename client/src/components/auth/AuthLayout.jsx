import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  Activity,
  ListVideo,
  LayoutGrid,
} from "lucide-react";

import AuthBackgroundWall from "./AuthBackgroundWall.jsx";
import Logo from "../layout/Logo.jsx";

const FEATURES = [
  { icon: CalendarCheck, title: "Schedule content across devices" },
  { icon: Activity, title: "Real-time device monitoring" },
  { icon: ListVideo, title: "Playlist & content library" },
  { icon: LayoutGrid, title: "Centralized dashboard overview" },
];

function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex bg-bg-primary overflow-hidden">
      <AuthBackgroundWall />

      <aside className="hidden md:flex relative z-10 flex-col justify-between gap-8 w-[44%] px-12 py-10 bg-[rgba(13,15,22,0.25)] backdrop-blur-[4px]">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span
            className="font-semibold text-sm text-white"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,.8)" }}
          >
            CastWise
          </span>
        </div>

        <div
          className="flex flex-col gap-7"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,.85)" }}
        >
          <h1 className="text-[32px] font-medium leading-[1.15] tracking-tight text-white max-w-[440px] text-balance m-0">
            Manage your screens from one dashboard
          </h1>
          <div className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3.5 items-start">
                <span className="flex-none w-9 h-9 rounded-lg bg-bg-primary/75 border border-accent-blue/45 text-accent-blue flex items-center justify-center backdrop-blur-sm">
                  <f.icon size={18} />
                </span>
                <span className="font-medium text-white pt-0.5">
                  {f.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <span
          className="text-xs text-neutral-400"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.8)" }}
        >
          © 2026 CastWise
        </span>
      </aside>

      <main className="relative z-10 flex-1 min-w-0 flex flex-col px-5 py-8 md:px-14 md:py-12 bg-[rgba(13,15,22,0.55)] backdrop-blur-[26px] [backdrop-filter:blur(26px)_saturate(1.3)]">
        <div className="md:hidden flex items-center gap-2.5 mb-9">
          <Logo size={32} />
          <span className="font-semibold text-sm text-text-primary">
            CastWise
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[380px]">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium text-accent-blue hover:underline"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;

// Shared split-screen frame for Login/Register/Forgot/Reset password pages
// — matches selected Claude Design mock "DFM-Auth-1a" (Classic panel
// variant): decorative background wall extracted to
// components/AuthBackgroundWall.jsx. Left context panel (logo, tagline,
// feature list, copyright) hidden below md; form area on the right is
// frosted glass, where `children` renders, capped at 380px wide.
// A "Back to home" link (underlines on hover) returns to the landing page.
// Used by: pages/Login.jsx, pages/Register.jsx, pages/ForgotPassword.jsx,
// pages/ResetPassword.jsx.