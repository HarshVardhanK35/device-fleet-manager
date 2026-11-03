import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  ListVideo,
  Image as ImageIcon,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

import { getDevices } from "../api/devices.js";
import { getAssignments } from "../api/assignments.js";
import { getPlaylists } from "../api/playlists.js";
import { getContent } from "../api/content.js";

import { getDeviceSummary } from "../utils/assignmentStatus.js";
import { timeAgo } from "../utils/timeAgo.js";
import { pluralizeCount, pluralizeWord } from "../utils/pluralize.js";

import StatTile from "../components/dashboard/StatTile.jsx";
import LimitsPanel from "../components/dashboard/LimitsPanel.jsx";
import DashboardAttentionPanel from "../components/dashboard/DashboardAttentionPanel.jsx";
import ContentTile from "../components/content/ContentTile.jsx";
import RefreshButton from "../components/ui/RefreshButton.jsx";
import { useAuth } from "../context/useAuth.js";

const RECENT_CONTENT_COUNT = 4;

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    load();
  }, []);

  // Initial state is already loading; a manual refresh keeps the page up and
  // just swaps the data in.
  async function load() {
    const [deviceData, assignmentData, playlistData, contentData] =
      await Promise.all([
        getDevices(),
        getAssignments(),
        getPlaylists(),
        getContent(),
      ]);

    setDevices(deviceData);
    setAssignments(assignmentData);
    setPlaylists(playlistData);
    setContent(contentData);
    setLoading(false);
  }

  const mergedDevices = devices.map((d) => ({
    ...d,
    assignments: assignments.filter((a) => a.deviceId?._id === d._id),
  }));

  const online = mergedDevices.filter((d) => d.status === "online");
  const offline = mergedDevices.filter((d) => d.status !== "online");
  const idle = online.filter(
    (d) => getDeviceSummary(d).text === "Nothing scheduled",
  );

  // Every screen, healthiest first: playing, then online with nothing
  // scheduled, then offline (most recently seen first, so the longest-offline
  // screen is last).
  const attentionItems = [
    ...online
      .filter((d) => !idle.includes(d))
      .map((device) => ({
        device,
        kind: "ok",
        since: "",
        reason: `Playlist: ${getDeviceSummary(device).text.replace(/^Playing /, "")}`,
      })),
    ...idle.map((device) => ({
      device,
      kind: "idle",
      since: timeAgo(device.lastSeenAt),
      reason: "Nothing scheduled right now",
    })),
    ...[...offline]
      .sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt))
      .map((device) => ({
        device,
        kind: "off",
        since: timeAgo(device.lastSeenAt),
        reason: `Last seen ${timeAgo(device.lastSeenAt)}`,
      })),
  ];

  const imageCount = content.filter((c) => c.type === "image").length;
  const videoCount = content.filter((c) => c.type === "video").length;
  const appCount = content.filter((c) => c.type === "app").length;

  const recentContent = [...content]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, RECENT_CONTENT_COUNT);

  const quickLinks = [
    {
      title: "Content",
      icon: ImageIcon,
      sub: pluralizeCount(content.length, "item"),
      onClick: () => navigate("/content"),
    },
    {
      title: "Playlists",
      icon: ListVideo,
      sub: pluralizeCount(playlists.length, "playlist"),
      onClick: () => navigate("/playlists"),
    },
    {
      title: "Assignments",
      icon: CalendarCheck,
      sub: pluralizeCount(assignments.length, "active assignment"),
      onClick: () => navigate("/assignments"),
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="skeleton h-14 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-primary text-[32px] font-bold m-0">
            Welcome
            {user?.firstName
              ? `, ${user.firstName.charAt(0).toUpperCase()}${user.firstName.slice(1)}`
              : ""}
          </h1>
          <div className="flex items-center justify-between gap-3">
            <p className="text-text-muted text-sm m-0">
              Screen status
              <span className="hidden sm:inline">
                {" "}as of {new Date().toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span className="sm:hidden">
                {" "}· {new Date().toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </p>
            {/* phones: icon only, straight after the date at the right end */}
            <div className="md:hidden">
              <RefreshButton onRefresh={load} />
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <RefreshButton onRefresh={load} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatTile
          className="col-span-2 md:col-span-1"
          label="Total devices"
          icon={Monitor}
          value={mergedDevices.length}
          sub={`${online.length} online · ${offline.length} offline`}
        />
        <StatTile
          label="Online"
          dot="#3fb950"
          value={online.length}
          valueClassName="text-accent-green"
          sub={pluralizeWord(online.length, "Device")}
        />
        <StatTile
          label="Offline"
          dot="#f0426a"
          value={offline.length}
          valueClassName={offline.length ? "text-accent-red" : ""}
          sub={pluralizeWord(offline.length, "Device")}
        />
        <StatTile
          label="Playlists"
          icon={ListVideo}
          value={playlists.length}
          sub={pluralizeCount(assignments.length, "active assignment")}
        />
        <StatTile
          label="Content items"
          icon={ImageIcon}
          value={content.length}
          sub={`${pluralizeCount(imageCount, "image")} · ${pluralizeCount(videoCount, "video")} · ${pluralizeCount(appCount, "app")}`}
        />
      </div>

      {/* lg+: needs-attention | recently created (2 x 2) | the three shortcuts
          stacked. The attention panel sets the row height; the other two stretch
          to match it. Below lg everything stacks and the shortcuts become a row. */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-4">
        <div>
          <DashboardAttentionPanel
            items={attentionItems}
            onOpenAssignments={() => navigate("/assignments")}
          />
        </div>

        <div className="bg-bg-panel border border-border-muted rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-muted">
            <span className="font-semibold text-[15px] text-text-primary">
              Recently created
            </span>
            <button
              onClick={() => navigate("/content")}
              className="text-accent-blue text-[12.5px] font-medium hover:underline"
            >
              View all content
            </button>
          </div>

          <div className="p-3 flex-1 min-h-0 flex flex-col">
            {recentContent.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                No content yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 xl:grid-rows-2 gap-3 flex-1 min-h-0">
                {recentContent.map((item) => (
                  <ContentTile
                    key={item._id}
                    item={item}
                    size="fluid"
                    coloredType
                    className="xl:h-full xl:flex xl:flex-col"
                    thumbClassName="aspect-video xl:aspect-auto xl:flex-1 xl:min-h-[64px]"
                    onClick={() => navigate("/content")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-1 xl:grid-rows-3 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.title}
              onClick={link.onClick}
              className="bg-bg-panel border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-xl p-4 flex items-center gap-3.5 text-left transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-accent-blue/15 text-accent-blue flex items-center justify-center flex-none">
                <link.icon size={20} />
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="truncate font-semibold text-text-primary">
                  {link.title}
                </div>
                <div className="truncate text-text-muted text-[12.5px]">{link.sub}</div>
              </div>
              <ArrowRight size={16} className="text-text-muted flex-none" />
            </button>
          ))}
        </div>
      </div>

      <LimitsPanel content={content} screenCount={devices.length} />
    </div>
  );
}

export default Dashboard;
