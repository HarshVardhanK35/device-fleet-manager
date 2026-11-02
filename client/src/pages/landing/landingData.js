import {
  CalendarDays,
  CloudSun,
  Clock,
  Contrast,
  Dumbbell,
  Eye,
  GraduationCap,
  Images,
  LayoutGrid,
  ListChecks,
  ListMusic,
  Megaphone,
  Monitor,
  PartyPopper,
  Radio,
  RotateCw,
  Rss,
  Smartphone,
  Sparkles,
  Stethoscope,
  Tablet,
  Tv,
  Type,
  UtensilsCrossed,
  Zap,
  Building2,
  Coffee,
  CalendarCheck,
  Link2,
  Laptop,
} from "lucide-react";

// All landing-page copy, icon choices and which illustration (shot) each
// image spot uses live here (text is from the
// CastWise A1 COPY.md). Used by: pages/Landing.jsx.

export const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#show", label: "What to show" },
  { href: "#control", label: "Control" },
  { href: "#looks", label: "Looks" },
];

export const USE_CASES = [
  { value: "Café", icon: Coffee },
  { value: "Restaurant", icon: UtensilsCrossed },
  { value: "Clinic", icon: Stethoscope },
  { value: "Gym", icon: Dumbbell },
  { value: "Office", icon: Building2 },
  { value: "School", icon: GraduationCap },
];

export const STEPS = [
  { icon: Link2, title: "Pair a screen", text: "Open CastWise on the screen and type the short code it shows into your account." },
  { icon: LayoutGrid, title: "Add what to show", text: "Pick a menu, a notice, the weather or your own photos." },
  { icon: CalendarCheck, title: "Choose when it plays", text: "Set start and end times, or let it run all day." },
];

// kind: "big" (text beside a 4:3 filler), "small" (stacked), "wide" (full row)
export const FEATURES = [
  {
    order: 1,
    kind: "big",
    icon: ListChecks,
    kicker: "Status List",
    shot: "board",
    title: "Run a live menu or stock board",
    text: "Mark each item In, Low or Out and show today's offers to customers. A kitchen view puts what's running low at the top.",
    legend: [["green", "In"], ["amber", "Low"], ["red", "Out"]],
    chips: ["List, grid or spotlight layouts", "A banner line for what matters", "Rows flash when something changes"],
    alt: "a menu board with items marked In, Low or Out",
  },
  {
    order: 4,
    kind: "big",
    icon: Megaphone,
    kicker: "Rotating Notices",
    shot: "notices",
    title: "Make the important message stand out",
    text: "Boards rotate on a timer, each with an urgent, a warning and an info message. Post an urgent notice and it takes over the board.",
    legend: [["red", "Urgent"], ["amber", "Warning"], ["blue", "Info"]],
    chips: ["Urgent messages glow", "Critical mode", "Re-alert sweep"],
    alt: "a notice board with urgent, warning and info messages",
  },
  {
    order: 5,
    kind: "big",
    icon: PartyPopper,
    kicker: "Event Cards",
    shot: "card",
    title: "Celebrate birthdays, welcomes and milestones",
    text: "Add a photo and a date, and the badge updates itself to Today or Tomorrow. Switch on confetti, fireworks or numbers that count up.",
    chips: ["Birthdays", "Milestones", "Welcomes", "Congratulations", "Holidays"],
    alt: "a birthday card with a photo and a Today badge",
  },
  {
    order: 2,
    kind: "small",
    icon: CloudSun,
    kicker: "Weather",
    shot: "weather",
    title: "Show today's weather and the days ahead",
    text: "Set your location once. The forecast keeps itself current.",
    alt: "weather forecast for today and the coming days",
  },
  {
    order: 3,
    kind: "small",
    icon: Clock,
    kicker: "Clock",
    shot: "clock",
    title: "Keep the right time on the wall",
    text: "The time is always correct, shown in the style you pick.",
    alt: "a large clock on screen",
  },
  {
    order: 6,
    kind: "small",
    icon: Rss,
    kicker: "Media feeds",
    shot: "feed",
    title: "Share headlines that refresh themselves",
    text: "Add a news or media feed and new stories appear on their own.",
    alt: "a feed of headlines on screen",
  },
  {
    order: 7,
    kind: "wide",
    icon: Images,
    kicker: "Images & video",
    shot: "photo",
    title: "Play your own photos and videos",
    text: "Upload pictures and clips and they play in turn. Good for promotions, menus and welcome screens.",
    alt: "your own photo playing full screen",
  },
];

export const CONTROLS = [
  { icon: ListMusic, title: "Build playlists", text: "Line up what plays and in what order. Change the order any time." },
  { icon: CalendarDays, title: "Schedule start and end times", text: "Show the breakfast menu in the morning and the dinner menu at night." },
  { icon: Eye, title: "Preview exactly what plays", text: "See what a screen will show before anyone in the room does." },
  { icon: Radio, title: "Take over a screen", text: "Push one message to a screen right away, then hand it back to its playlist." },
  { icon: Monitor, title: "One dashboard for every screen", text: "See which screens are playing and which need attention." },
  { icon: Zap, title: "Changes arrive quickly", text: "Edit something and the screen picks it up in moments." },
];

export const LOOKS = [
  { icon: Contrast, title: "Light or dark screens", shot: "lightdark", text: "Pick the look that suits your room and its lighting.", alt: "one board in light and dark" },
  { icon: Type, title: "A choice of fonts", shot: "fonts", text: "Choose a font that fits your brand and reads well from across the room.", alt: "the same notice in different fonts" },
  { icon: Sparkles, title: "Attention effects, your call", shot: "effects", text: "Glows, flashes and sweeps help messages get noticed. Switch each one on or off.", alt: "a message with and without a glow" },
  { icon: RotateCw, title: "Portrait or landscape", shot: "orientation", text: "Mount the screen either way and the layout fits.", alt: "one board on a portrait and a landscape screen" },
];

export const DEVICES = [
  { icon: Tv, label: "Smart TV" },
  { icon: Tablet, label: "Tablet" },
  { icon: Laptop, label: "Laptop or PC" },
  { icon: Smartphone, label: "Spare phone" },
];

