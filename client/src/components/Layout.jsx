import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import ScrollBox from "./ScrollBox.jsx";
import ActionMenu from "./ActionMenu.jsx";

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
  Menu,
  X,
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
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-bg-panel border-b border-border-muted w-full flex items-center gap-6 px-5 h-14 flex-shrink-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
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
                `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ActionMenu
          label="User menu"
          align="end"
          trigger={
            <button
              type="button"
              className="ml-auto w-9 h-9 rounded-full bg-bg-hover border border-border-muted flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-hover transition-colors outline-none focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-2"
            >
              {initials ? (
                <span className="text-xs font-bold text-text-primary">
                  {initials}
                </span>
              ) : (
                <User size={16} />
              )}
            </button>
          }
          items={[
            {
              label: "Logout",
              icon: LogOut,
              variant: "danger",
              onClick: handleLogout,
            },
          ]}
        />
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-bg-primary flex flex-col">
          <div className="flex justify-end p-4 pb-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              title="Close menu"
              aria-label="Close navigation menu"
              className="w-9 h-9 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-bg-hover text-text-primary"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
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
// links + user-avatar dropdown with Logout) instead of the earlier
// collapsible sidebar — matches the Content Library mock's top-nav
// pattern. No search bar here — pages that need search (e.g. Content) have
// their own, scoped to what they're actually searching. Page content
// scrolls via ScrollBox, not the native browser scrollbar.
// Used by: App.jsx, wrapping Dashboard, Content, Assignments, Playlists,
// and PlayerSlots (the "Player" tab). NOT used on Login/Register or the
// device-facing Player page at "/player/:deviceId" (those have no
// nav/console chrome) — not to be confused with the "Player" nav tab
// above, which is PlayerSlots.jsx at "/player".
