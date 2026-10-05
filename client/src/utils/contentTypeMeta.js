// Per-content-type color/label metadata, extracted from the Content Library
// mock (ContentLibrary-B-Sidebar.html): image=blue, video=amber, app=green.
export const TYPE_META = {
  image: {
    label: "IMAGE",
    textClass: "text-accent-blue",
    bgClass: "bg-accent-blue/15",
  },
  video: {
    label: "VIDEO",
    textClass: "text-accent-amber",
    bgClass: "bg-accent-amber/15",
  },
  app: {
    label: "APP",
    textClass: "text-accent-green",
    bgClass: "bg-accent-green/15",
  },
};

export function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.image;
}
