import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import Logo from "./Logo.jsx";
import ScrollBox from "./ScrollBox.jsx";
import { SCROLL_TOP_EVENT } from "./scrollTop.js";
import ActionMenu from "../ui/ActionMenu.jsx";

import { useAuth } from "../../context/useAuth.js";
import { getInitials } from "../../utils/format/getInitials.js";
import { prefetchMainPages, prefetchRoute } from "../../pageLoaders.js";
import { useFeedbackIndicator } from "../../hooks/useFeedbackIndicator.js";

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
  Users,
  Inbox,
  MessageSquareText,
  CircleHelp,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/content", label: "Media", icon: Image },
  { to: "/playlists", label: "Playlists", icon: ListVideo },
  { to: "/assignments", label: "Publish", icon: MonitorPlay },
  { to: "/player", label: "Player", icon: PlaySquare },
];

// Only shown to admins.
const adminItem = { to: "/admin/users", label: "Users", icon: Users };

// The link just above Collapse: a user sends feedback, the admin reads it.
const feedbackItem = { to: "/feedback", label: "Feedback", icon: MessageSquareText };
const inboxItem = { to: "/admin/inbox", label: "Inbox", icon: Inbox };

// The FAQ: a public page of its own (no app shell), linked under Feedback / Inbox.
const helpItem = { to: "/help", label: "Help", icon: CircleHelp };

// A red dot on a link: something new is waiting there.
function RedDot({ className = "" }) {
  return (
    <span
      aria-label="New"
      className={`h-2 w-2 flex-none rounded-full bg-[#f85149] ${className}`}
    />
  );
}

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
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  // The page's scroll area, for "tap the active tab to go back to the top" on phones.
  const pageScrollRef = useRef(null);
  useEffect(() => {
    prefetchMainPages();
  }, []);
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

  const isAdmin = user?.role === "admin";
  const items = isAdmin ? [...navItems, adminItem] : navItems;
  // Red dots: the admin sees one while messages are still Sent or Seen; a user
  // sees one when the admin has answered or changed a status.
  const indicator = useFeedbackIndicator();
  const bottomItem = isAdmin ? inboxItem : feedbackItem;
  const bottomDot = isAdmin ? indicator.adminOpen > 0 : indicator.unread > 0;
  const userName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "";
  const initials = getInitials(userName);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // Phones: the five main pages are the tabs at the bottom; the rarely used ones and Log out are in
  // the avatar's menu.
  const avatarItems = [
    ...(isAdmin
      ? [
          { label: adminItem.label, icon: adminItem.icon, onClick: () => navigate(adminItem.to) },
          { label: inboxItem.label, icon: inboxItem.icon, onClick: () => navigate(inboxItem.to) },
        ]
      : [{ label: feedbackItem.label, icon: feedbackItem.icon, onClick: () => navigate(feedbackItem.to) }]),
    { label: helpItem.label, icon: helpItem.icon, onClick: () => navigate(helpItem.to) },
    { label: "Log out", icon: LogOut, variant: "danger", onClick: handleLogout },
  ];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <header className="relative bg-bg-panel border-b border-border-muted w-full flex items-center gap-6 pl-5 pr-4 md:pr-5 h-14 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-text-primary font-bold">CastWise</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative md:hidden">
            <ActionMenu
              label="Account menu"
              align="end"
              items={avatarItems}
              header={userName || undefined}
              trigger={
                <button
                  type="button"
                  aria-label="Account menu"
                  className="w-9 h-9 rounded-full bg-bg-hover border border-border-muted flex items-center justify-center text-text-muted"
                >
                  {initials ? <span className="text-xs font-bold text-text-primary">{initials}</span> : <User size={16} />}
                </button>
              }
            />
            {bottomDot && <RedDot className="absolute -right-0.5 -top-0.5 ring-2 ring-bg-panel" />}
          </div>
          <span
            title={userName}
            className="hidden md:flex w-9 h-9 rounded-full bg-bg-hover border border-border-muted items-center justify-center text-text-muted cursor-default"
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

      <div className="flex-1 min-h-0 flex">
        {/* Page links as a left side navbar (md and up): the full 192px bar by
            default, icon-only when collapsed (a dark label pops out on hover).
            Profile and Logout stay in the top header. */}
        <nav
          className={`relative z-30 hidden md:flex flex-col flex-shrink-0 gap-1 bg-bg-panel border-r border-border-muted transition-[width] duration-200 ${
            collapsed ? "w-16 p-2" : "w-48 p-3"
          }`}
        >
          {items.map((item) => (
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

          <NavLink
            to={bottomItem.to}
            aria-label={bottomItem.label}
            className={({ isActive }) =>
              `group relative mt-auto flex items-center justify-center gap-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? "" : "!justify-start px-3"
              } ${
                isActive
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
              }`
            }
          >
            <bottomItem.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{bottomItem.label}</span>}
            {bottomDot && (
              <RedDot className={collapsed ? "absolute right-2 top-1.5 ring-2 ring-bg-panel" : "ml-1"} />
            )}
            {collapsed && <NavTip>{bottomItem.label}</NavTip>}
          </NavLink>

          <NavLink
            to={helpItem.to}
            aria-label={helpItem.label}
            className={`group relative flex items-center justify-center gap-3 h-10 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors ${
              collapsed ? "" : "!justify-start px-3"
            }`}
          >
            <helpItem.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{helpItem.label}</span>}
            {collapsed && <NavTip>{helpItem.label}</NavTip>}
          </NavLink>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className={`group relative flex items-center justify-center gap-3 h-10 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors ${
              collapsed ? "" : "!justify-start px-3"
            }`}
          >
            {collapsed ? <PanelLeftOpen size={18} className="flex-shrink-0" /> : <PanelLeftClose size={18} className="flex-shrink-0" />}
            {!collapsed && <span>Collapse</span>}
            {collapsed && <NavTip>Expand</NavTip>}
          </button>
        </nav>

        <ScrollBox ref={pageScrollRef} className="flex-1 min-w-0 p-4">
          <div className="bg-bg-primary text-text-primary min-h-full">
            {children}
          </div>
        </ScrollBox>
      </div>

      {/* Phones: the five main pages as tabs at the bottom (the tab bar is 3.5rem tall; the sticky
          action bars and the toasts sit above it). */}
      <nav
        aria-label="Main"
        className="md:hidden flex flex-shrink-0 bg-bg-panel border-t border-border-muted pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => {
              // tapping the tab of the page you are on scrolls it back to the top
              const here = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
              if (!here) return;
              pageScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              window.dispatchEvent(new Event(SCROLL_TOP_EVENT));
            }}
            className={({ isActive }) =>
              `flex-1 min-w-0 h-14 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-accent-blue" : "text-text-muted active:text-text-primary"
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className="truncate max-w-full px-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>
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
// the five main pages are tabs in a bar at the bottom, and the avatar opens a menu with the rarely
// used pages (Feedback, or Users and Inbox for an admin) and Log out. No
// search bar here — pages that need search (e.g. Content) have their own.
// Page content scrolls via ScrollBox, not the native browser scrollbar.
// Used by: App.jsx, wrapping Dashboard, Content, Assignments, Playlists,
// and PlayerSlots (the "Player" tab). NOT used on Login/Register or the
// device-facing Player page at "/player/:token" (those have no
// nav/console chrome) — not to be confused with the "Player" nav tab
// above, which is PlayerSlots.jsx at "/player".
