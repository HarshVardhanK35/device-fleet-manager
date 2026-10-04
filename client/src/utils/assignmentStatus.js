export function getAssignmentStatus(a, device) {
  const now = new Date();
  const begin = new Date(a.beginDT);
  const end = new Date(a.endDT);
  const raw = now < begin ? "upcoming" : now > end ? "ended" : "live";
  const paused = raw === "live" && device.status !== "online";
  return paused ? "paused" : raw;
}

export function getDeviceSummary(device) {
  const live = device.assignments.find(
    (a) => getAssignmentStatus(a, device) === "live",
  );
  if (live) {
    return {
      color: "bg-accent-green",
      text: `Playing ${live.playlistId?.name ?? "Unknown"}`,
    };
  }

  const paused = device.assignments.find(
    (a) => getAssignmentStatus(a, device) === "paused",
  );
  if (paused) {
    return {
      color: "bg-accent-amber",
      text: `Missed: ${paused.playlistId?.name ?? "Unknown"}`,
    };
  }

  return { color: "bg-text-muted", text: "Nothing scheduled" };
}

export const STATUS_PILL = {
  live: {
    label: "Live now",
    className: "bg-accent-green/15 text-accent-green",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-accent-blue/15 text-accent-blue",
  },
  paused: {
    label: "Scheduled · device offline",
    className: "bg-accent-amber/15 text-accent-amber",
  },
  ended: { label: "Ended", className: "bg-bg-hover text-text-muted" },
};

export const TIMELINE_DOT = {
  live: "bg-accent-green",
  upcoming: "bg-bg-primary border-2 border-accent-blue",
  paused: "bg-accent-amber",
  ended: "bg-bg-hover",
};
