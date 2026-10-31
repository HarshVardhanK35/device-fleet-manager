import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import ScrollBox from "./ScrollBox.jsx";

import { useAuth } from "../context/useAuth.js";
import { getInitials } from "../utils/getInitials.js";

import {
  Home,
  Image,
  MonitorPlay,
  ListVideo,
  Monitor,
  PlaySquare,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/content", label: "Content", icon: Image },
  { to: "/playlists", label: "Playlists", icon: ListVideo },
  { to: "/assignments", label: "Assignments", icon: MonitorPlay },
  { to: "/player", label: "Player", icon: PlaySquare },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "";
  const initials = getInitials(userName);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <header className="relative bg-bg-panel border-b border-border-muted w-full flex items-center gap-6 pl-5 pr-4 md:pr-5 h-14 flex-shrink-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          title={mobileMenuOpen ? "Close" : "Menu"}
          className={`md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-text-muted border border-transparent transition-colors ${
            mobileMenuOpen
              ? "hover:text-accent-red hover:bg-accent-red/10 hover:border-accent-red/40"
              : "hover:bg-bg-hover hover:text-text-primary"
          }`}
        >
          {/* Three bars that morph into an X while the menu is open. */}
          <span className="relative block w-[18px] h-[14px]">
            {[
              mobileMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
              mobileMenuOpen ? "top-1/2 -translate-y-1/2 opacity-0" : "top-1/2 -translate-y-1/2",
              mobileMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-full -translate-y-full",
            ].map((pos, i) => (
              <span
                key={i}
                className={`absolute left-0 w-full h-[2px] rounded-full bg-current transition-all duration-300 ease-in-out ${pos}`}
              />
            ))}
          </span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center">
            <Monitor size={18} className="text-white" />
          </span>
          <span className="text-text-primary font-bold">DFM</span>
        </div>

        <nav className="hidden md:flex items-center gap-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium origin-center transition-all duration-200 hover:scale-110 ${
                  isActive
                    ? "text-accent-blue scale-110"
                    : "text-text-muted hover:text-accent-blue"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span
            title={userName}
            className="w-9 h-9 rounded-full bg-bg-hover border border-border-muted flex items-center justify-center text-text-muted cursor-default"
          >
            {initials ? (
              <span className="text-xs font-bold text-text-primary">{initials}</span>
            ) : (
              <User size={16} />
            )}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="hidden md:flex w-9 h-9 rounded-lg items-center justify-center text-accent-red hover:bg-accent-red/10 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-bg-primary flex flex-col">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-bg-hover text-accent-blue"
                      : "text-text-muted hover:text-accent-blue hover:bg-bg-hover"
                  }`
                }
              >
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-3 origin-center transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "scale-110" : ""
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-4 border-t border-border-muted flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-bg-hover border border-border-muted flex items-center justify-center text-text-muted flex-shrink-0">
              {initials ? (
                <span className="text-xs font-bold text-text-primary">
                  {initials}
                </span>
              ) : (
                <User size={16} />
              )}
            </span>
            <span className="flex-1 text-text-primary text-sm font-medium truncate">
              {userName}
            </span>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              aria-label="Logout"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-accent-red hover:bg-accent-red/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}

      <ScrollBox className="p-4">
        <div className="bg-bg-primary text-text-primary min-h-full">
          {children}
        </div>
      </ScrollBox>
    </div>
  );
}

export default Layout;

// App shell wrapping every authenticated page: top navbar (logo + nav
// links + user avatar with a name tooltip and a Logout button) instead of the earlier
// collapsible sidebar — matches the Content Library mock's top-nav
// pattern. No search bar here — pages that need search (e.g. Content) have
// their own, scoped to what they're actually searching. Page content
// scrolls via ScrollBox, not the native browser scrollbar.
// Used by: App.jsx, wrapping Dashboard, Content, Assignments, Playlists,
// and PlayerSlots (the "Player" tab). NOT used on Login/Register or the
// device-facing Player page at "/player/:token" (those have no
// nav/console chrome) — not to be confused with the "Player" nav tab
// above, which is PlayerSlots.jsx at "/player".
