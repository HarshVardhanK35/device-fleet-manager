import { useEffect } from "react";

import { buildStorageReport } from "../offline/storageReport.js";

// While the screen is connected, tells its owner (a retained status message) about the
// browser and the offline storage, a moment after the saved files change.
export function useStorageReport({ publishStatus, online, connection, activeAssignment, savedKeys }) {
  useEffect(() => {
    if (!online || connection !== "connected") return undefined;
    const timer = setTimeout(() => {
      buildStorageReport(activeAssignment?.content || [], savedKeys)
        .then((report) => publishStatus(report))
        .catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, [publishStatus, online, connection, activeAssignment, savedKeys]);
}

// Used by: components/screens/DevicePlayback.jsx.
