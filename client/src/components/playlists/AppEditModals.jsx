import WeatherSettingsScreen from "../../apps/appModals/weather-modal.jsx";
import ClockSettingsScreen from "../../apps/appModals/clock-modal.jsx";
import RssSettingsScreen from "../../apps/appModals/rss-modal.jsx";
import AnnouncementsSettingsScreen from "../../apps/appModals/announcements-modal.jsx";

// The settings screen of an existing app item, opened from a playlist's details
// panel ("Edit app settings"). Same four screens the Content page uses.
//   item     the app item being edited (null = nothing open)
//   onClose  called when the screen is closed
//   onSaved  called after a save, so the page can reload its data
//   library  all the user's content (RSS and Announcements pick logos from it)
function AppEditModals({ item, onClose, onSaved, library }) {
  if (!item) return null;

  // Rows saved before `appType` existed: only Weather ever had a "range" field.
  const appType = item.configBlob?.appType ?? (item.configBlob?.range !== undefined ? "weather" : null);
  const common = {
    open: true,
    onOpenChange: (open) => !open && onClose(),
    existingContent: item,
    onSaved,
  };

  if (appType === "weather") return <WeatherSettingsScreen key={item._id} {...common} />;
  if (appType === "clock") return <ClockSettingsScreen key={item._id} {...common} />;
  if (appType === "rss") return <RssSettingsScreen key={item._id} {...common} library={library} />;
  if (appType === "announcements") return <AnnouncementsSettingsScreen key={item._id} {...common} library={library} />;
  return null;
}

export default AppEditModals;

// Used by: pages/Playlists.jsx.
