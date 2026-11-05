import { CloudSun, Clock, Rss, Megaphone, AppWindow } from "lucide-react";

import appsRegistry from "../../apps/appsRegistry.json";

// One icon per app, drawn plain in the theme's muted text colour (no accent
// colour, so a light theme needs nothing extra). An app whose entry in
// appsRegistry.json has a `thumbnail` shows that picture instead.
const ICONS = {
  weather: CloudSun,
  clock: Clock,
  rss: Rss,
  announcements: Megaphone,
};

// `appType` is the lowercase app type ("weather") or the registry name
// ("Weather"). `iconClassName` sizes the icon: a % width of the thumbnail box
// where it fills a tile ("w-[24%]"), or a fixed width ("w-7") in a small square.
function AppThumb({ appType, iconClassName = "w-[24%]", bold = false }) {
  const key = (appType || "").toLowerCase();
  const picture = appsRegistry.find((a) => a.name.toLowerCase() === key)?.thumbnail;

  if (picture) {
    return <img src={picture} alt="" className="w-full h-full object-cover" />;
  }

  const Icon = ICONS[key] || AppWindow;
  // `bold`: a brighter grey and a heavier line, for the big tiles where the icon
  // otherwise looks dull.
  return (
    <Icon
      className={`h-auto ${bold ? "text-[#b1bac4]" : "text-text-muted"} ${iconClassName}`}
      strokeWidth={bold ? 2 : 1.5}
      aria-hidden="true"
    />
  );
}

export default AppThumb;

// The picture for an app item or app row, in place of the old plain word "App".
// Used by: content/ContentTile.jsx, content/ContentDetailsPanel.jsx,
// content/ContentPickerModal.jsx, screens/ScreenThumb.jsx, apps/AppsPickerModal.jsx.
