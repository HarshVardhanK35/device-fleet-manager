import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import ScrollBox from "./ScrollBox.jsx";

import {
  Home,
  Image,
  MonitorPlay,
  ListVideo,
  UploadCloud,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/content", label: "Content", icon: Image },
  { to: "/assignments", label: "Assignments", icon: MonitorPlay },
  { to: "/playlists", label: "Playlists", icon: ListVideo },
  { to: "/publish", label: "Publish", icon: UploadCloud },
];

function Layout({ children }) {
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const isExpanded = isHovered || isPinned;

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${
          isExpanded ? "w-56 absolute left-0 top-0 h-screen z-20" : "w-16"
        } bg-bg-panel flex flex-col border-r border-bg-hover`}
      >
        <div className="relative flex items-center justify-between px-4 h-12">
          <span className="text-text-primary font-bold">DFM</span>

          <button
            onClick={() => setIsPinned(!isPinned)}
            className="text-text-muted absolute -right-3.5 top-3 bg-bg-hover rounded p-1"
          >
            {isPinned ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>
        </div>

        <ScrollBox>
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 ${isExpanded ? "" : "justify-center"} ${isActive ? "bg-bg-hover text-accent-blue" : "text-text-muted"}`
                }
              >
                <item.icon size={18} />
                {isExpanded && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </ScrollBox>
      </aside>

      <div className={`flex-1 flex flex-col ${isPinned ? "ml-56" : ""}`}>
        <header className="bg-bg-panel w-full flex items-center justify-between px-4 h-12">
          <input
            type="text"
            placeholder="Search..."
            className="bg-bg-hover text-text-primary px-2 py-1 rounded ml-5"
          />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-accent-red"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <ScrollBox className="p-4">
          <div className="bg-bg-primary text-text-primary min-h-full">
            {children}
          </div>
        </ScrollBox>
      </div>
    </div>
  );
}

export default Layout;

// App shell wrapping every authenticated page: collapsible sidebar
// (icon-only by default, expands on hover as an overlay or stays pinned
// open and reflows content) + top bar (search placeholder + Logout).
// Page content scrolls via ScrollBox, not the native browser scrollbar.
// Used by: App.jsx, wrapping Dashboard, Content, Assignments, Playlists,
// and Publish. NOT used on Login/Register or the device-facing Player page
// (those have no sidebar/console chrome).
