// Per-content-type color/label metadata, extracted from the Content Library
// mock (ContentLibrary-B-Sidebar.html): image=blue, video=amber, app=green.
// `solidBgClass` is an opaque version of `bgClass`, for a badge that sits on
// top of an image (the translucent one is unreadable there).
// `short` is the abbreviation shown on phones (IMG / VID), where the full word
// would squeeze the item name.
export const TYPE_META = {
  image: {
    label: "IMAGE",
    short: "IMG",
    textClass: "text-accent-blue",
    bgClass: "bg-accent-blue/15",
    solidBgClass: "bg-[#12294a]",
  },
  video: {
    label: "VIDEO",
    short: "VID",
    textClass: "text-accent-amber",
    bgClass: "bg-accent-amber/15",
    solidBgClass: "bg-[#3a2f10]",
  },
  app: {
    label: "APP",
    short: "APP",
    textClass: "text-accent-green",
    bgClass: "bg-accent-green/15",
    solidBgClass: "bg-[#14301c]",
  },
};

export function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.image;
}
