import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import Logo from "./Logo.jsx";
import ScrollBox from "./ScrollBox.jsx";

import { useAuth } from "../../context/useAuth.js";
import { getInitials } from "../../utils/getInitials.js";
import { prefetchRoute } from "../../pageLoaders.js";

import {
  Home,
  Image,
  MonitorPlay,
  ListVideo,
  PlaySquare,
  PanelLeftClose,
  PanelLeftOpen,
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

const COLLAPSED_KEY = "castwise-nav-collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

// Dark label that pops out to the right of an icon when the bar is icon-only.
function NavTip({ children }) {
  return (
    <span
      role="tooltip"
      className={"pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border-hover bg-bg-hover px-3 py-1.5 text-sm font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"}
    >
      <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-border-hover bg-bg-hover" />
      {children}
    </span>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Icon-only side bar, from the button at its foot. Expanded by default; the
  // choice is remembered.
  const [collapsed, setCollapsed] = useState(readCollapsed);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
      } catch {
        /* the choice just isn't remembered */
      }
      return !c;
    });
  }

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
          <Logo size={28} />
          <span className="text-text-primary font-bold">CastWise</span>
        </div>

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

      <div className="flex-1 min-h-0 flex">
        {/* Page links as a left side navbar (md and up): the full 192px bar by
            default, icon-only when collapsed (a dark label pops out on hover).
            Profile and Logout stay in the top header. */}
        <nav
          className={`relative z-30 hidden md:flex flex-col flex-shrink-0 gap-1 bg-bg-panel border-r border-border-muted transition-[width] duration-200 ${
            collapsed ? "w-16 p-2" : "w-48 p-3"
          }`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              aria-label={item.label}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={({ isActive }) =>
                `group relative flex items-center justify-center gap-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? "" : "!justify-start px-3"
                } ${
                  isActive
                    ? "bg-accent-blue/10 text-accent-blue"
                    : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
                }`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && <NavTip>{item.label}</NavTip>}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className={`group relative mt-auto flex items-center justify-center gap-3 h-10 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors ${
              collapsed ? "" : "!justify-start px-3"
            }`}
          >
            {collapsed ? <PanelLeftOpen size={18} className="flex-shrink-0" /> : <PanelLeftClose size={18} className="flex-shrink-0" />}
            {!collapsed && <span>Collapse</span>}
            {collapsed && <NavTip>Expand</NavTip>}
          </button>
        </nav>

        <ScrollBox className="flex-1 min-w-0 p-4">
          <div className="bg-bg-primary text-text-primary min-h-full">
            {children}
          </div>
        </ScrollBox>
      </div>
    </div>
  );
}

export default Layout;

// App shell wrapping every authenticated page: a top header (logo + name on
// the left, user avatar with a name tooltip and a Logout button on the right)
// with the page links in a left side navbar below it (md and up): the full
// 192px bar by default, and a button at its foot collapses it to a 64px icon
// rail (remembered in localStorage) where a dark label pops out beside the
// hovered icon. Hovering a link also pre-loads that page. On phones
// the links live in the morphing menu button's full-screen menu instead. No
// search bar here — pages that need search (e.g. Content) have their own.
// Page content scrolls via ScrollBox, not the native browser scrollbar.
// Used by: App.jsx, wrapping Dashboard, Content, Assignments, Playlists,
// and PlayerSlots (the "Player" tab). NOT used on Login/Register or the
// device-facing Player page at "/player/:token" (those have no
// nav/console chrome) — not to be confused with the "Player" nav tab
// above, which is PlayerSlots.jsx at "/player".
