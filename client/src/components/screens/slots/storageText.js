// Words for the Player page about a screen's browser and offline storage (what the screen
// reported, see offline/storageReport.js).

const at = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function browserText(report, loading) {
  if (report) return [report.browser, report.chromium ? `Chromium ${report.chromium.split(".")[0]}` : null].filter(Boolean).join(" · ");
  return loading ? "Checking…" : "—";
}

export function storageText(report, loading, online) {
  if (!report) return loading ? "Checking…" : "—";
  const parts = [];
  parts.push(report.quotaMB ? `${report.usedMB} of ${report.quotaMB} MB used` : "limit unknown");
  parts.push(report.wanted ? `${report.saved} of ${report.wanted} files saved` : "nothing to save");
  if (!online) parts.push(`as of ${at(report.at)}`);
  return parts.join(" · ");
}

export function storageHints(report) {
  if (!report) return [];
  const hints = [];
  if (report.lowStorage) {
    hints.push(
      `This screen's browser allows only ${report.quotaMB} MB of offline storage, so videos are saved at 480p. A long playlist may not fully play offline.`,
    );
  }
  if (report.notSaved?.length > 0) {
    hints.push(`Not saved for offline yet: ${report.notSaved.map((item) => item.name).join(", ")}. Offline, the screen skips them.`);
  }
  return hints;
}

// Used by: components/screens/slots/ScreenDetails.jsx.
