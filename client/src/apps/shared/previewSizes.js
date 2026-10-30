import { Monitor, Tablet, Smartphone } from "lucide-react";

// Shared by AppSettingsShell (the 3-button toggle) and AppPreviewFrame (the
// actual box sizing) — one source of truth so both always agree on what
// "tablet" etc. actually means.
export const PREVIEW_SIZES = {
  desktop: { label: "Desktop", icon: Monitor, aspect: "16/9", maxWidth: "1280px" },
  tablet: { label: "Tablet", icon: Tablet, aspect: "4/3", maxWidth: "800px" },
  mobile: { label: "Mobile", icon: Smartphone, aspect: "9/16", maxWidth: "360px" },
};
