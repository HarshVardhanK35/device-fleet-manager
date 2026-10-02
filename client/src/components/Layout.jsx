import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
  const [isPinned, setIsPinned] = useState(false);
  const isExpanded = isHovered || isPinned;

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
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

        <main className="bg-bg-primary flex-1 p-4 text-text-primary">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
