// The app type of a saved app item ("weather", "clock", "rss", "announcements").
// Weather tiles saved before `appType` existed only have the old `range`
// field, so fall back on that.
// Used by: components/content/*, components/screens/ScreenThumb.jsx.
export function appTypeOf(item) {
  const blob = item?.configBlob;
  if (blob?.appType) return blob.appType;
  return blob?.range !== undefined ? "weather" : undefined;
}
