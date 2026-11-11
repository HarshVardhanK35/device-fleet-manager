// The FAQ, as data: the Help page renders from this one array and builds its search text and its
// structured data (FAQPage) from it too.
//
// Inline marks in any string:
//   [[Name]]              a button or menu name as it appears in the app (shown as a chip)
//   hello@castwise.site   an email link
//
// A question's `blocks` (1 to 3): { p } paragraph, { steps } numbered list, { ul } bullet list,
// { table } [key, value] rows under "Item" / "Limit", { tip } one callout.
// `icon` is the name of a lucide icon, resolved in HelpSections.jsx.
//
// Facts checked against the app (limits.js, the Player / Publish / Playlists pages, the session
// warning) on 2026-11-11: when one of them changes, change its answer here.
export const HELP_EMAIL = "hello@castwise.site";

export const HELP_CONTENT = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "Rocket",
    questions: [
      {
        id: "what-is-castwise",
        q: "What is CastWise?",
        blocks: [
          {
            p: "CastWise turns any TV or screen with a web browser into digital signage. You upload images and videos, make apps like weather, clock, news and announcements, arrange them into playlists and publish them to your screens on a schedule.",
          },
          { p: "You manage everything from your browser. Screens pick up changes on their own." },
        ],
      },
      {
        id: "connect-a-screen",
        q: "How do I connect a screen?",
        blocks: [
          {
            steps: [
              "On the screen, open its web browser and go to castwise.site/screens. A pairing code appears.",
              "In CastWise, open [[Player]] and pick a free slot.",
              "Type the code shown on the screen and choose [[Pair screen]].",
              "The screen starts within a few seconds. To rename it, open the screen and choose ⋯ → [[Edit]].",
            ],
          },
          {
            tip: "A paired screen remembers its pairing. After a restart, open castwise.site/screens again and tap the screen to start.",
          },
        ],
      },
      {
        id: "account-limits",
        q: "What are the limits of my account?",
        blocks: [
          {
            table: [
              ["Screens", "3"],
              ["Images", "30"],
              ["Video storage", "150 MB in total"],
              ["Per file", "Images 10 MB, videos 100 MB"],
              ["Repeats in a playlist", "Same image up to 3 times; other content once"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "screens",
    title: "Screens",
    icon: "Tv",
    questions: [
      {
        id: "supported-tvs",
        q: "Which TVs and browsers work?",
        blocks: [
          {
            p: "Any TV or screen that has a web browser: a smart TV, a TV box or stick, or a small computer or tablet connected to a display.",
          },
          {
            ul: [
              "Tested and supported: Chromium 79, 85 and 94, and newer. Apps need Chromium 79 or newer.",
              "TVs from around 2015 and older cannot run CastWise.",
            ],
          },
        ],
      },
      {
        id: "refresh-and-take-over",
        q: "What do “Refresh screen” and “Take over” do?",
        blocks: [
          {
            p: "[[Refresh screen]] (in the ⋯ menu of a screen on the Player page) restarts the playlist from its first item on that screen. It works while the screen is online, once a minute.",
          },
          {
            p: "[[Take over…]] plays the screen on the device you are using and disconnects the real screen, because only one device can play a screen at a time. Choose [[Release to screen]] to hand it back.",
          },
        ],
      },
      {
        id: "screen-stuck",
        q: "A screen looks stuck. What should I do?",
        blocks: [
          {
            steps: [
              "Open [[Player]] and pick the screen. Check its status and when it was last seen.",
              "Choose ⋯ → [[Refresh screen]].",
              "If nothing changes, reload castwise.site/screens on the TV, or restart the TV.",
              "Still stuck? Pull the screen's logs and email the zip to hello@castwise.site, any day between 8 AM and 6 PM IST. The steps are under “A screen misbehaves”.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "content",
    title: "Content and playlists",
    icon: "Images",
    questions: [
      {
        id: "what-can-i-show",
        q: "What can I put on a screen?",
        blocks: [
          {
            ul: [
              "Images",
              "Videos",
              "Apps: weather, clock, news (RSS) and announcements",
            ],
          },
        ],
      },
      {
        id: "apps",
        q: "What are apps (weather, clock, news, announcements)?",
        blocks: [
          {
            p: "Apps are live items you add to a playlist like any image. You make one from the Media page with [[Create]] and set it up in its settings.",
          },
          {
            p: "Weather and news refresh while they play, and each app has its own look. Announcements show your own text on a board, such as notices, a status list or event cards.",
          },
        ],
      },
      {
        id: "playlist-timing",
        q: "How does a playlist play, and how long does each item show?",
        blocks: [
          {
            p: "Items play from top to bottom, then start again. Videos play to the end.",
          },
          {
            p: "Images and apps show for the time set on the item. Change it in the item's details: pick 5, 10, 15, 30 or 60 seconds, or type your own. The news and announcements apps work out their own time from what they show.",
          },
        ],
      },
      {
        id: "skip",
        q: "What does Skip do?",
        blocks: [
          {
            p: "Select items in a playlist and choose [[Skip]]. A skipped item stays in the playlist but is left out when it plays. Select it again and choose [[Unskip]] to bring it back.",
          },
          { p: "If a skip would leave nothing to play, CastWise asks you first." },
        ],
      },
      {
        id: "fill-the-screen",
        q: "What does “Fill the screen” do?",
        blocks: [
          {
            p: "Open an item's details in a playlist and use [[Fill the screen]]. On, it covers the whole screen and may crop the edges when the shapes differ. Off, the whole picture shows with bars at the sides. Images fill by default; videos show whole.",
          },
          { tip: "Pictures in 16:9 (for example 1920 × 1080) fit a TV with nothing cropped." },
        ],
      },
    ],
  },
  {
    id: "publishing",
    title: "Publishing",
    icon: "Radio",
    questions: [
      {
        id: "publish-a-playlist",
        q: "How do I put a playlist on a screen?",
        blocks: [
          {
            steps: [
              "Open [[Publish]], pick a screen and choose [[Publish]].",
              "Pick the playlist.",
              "Set [[Begins at]] and [[Ends at]]. The times are in the screen's local time, up to 3 months ahead.",
              "Tick the screens it should play on and choose [[Publish]].",
            ],
          },
        ],
      },
      {
        id: "schedules",
        q: "Can I schedule when it starts and ends, and what if two schedules overlap?",
        blocks: [
          {
            p: "Yes. Every publish has a start and an end, and the screen plays the playlist between them.",
          },
          {
            p: "If a new schedule overlaps one already on a screen, that screen's row shows a warning with an [[Override]] switch. Switching it on trims the older schedule to make room, or splits it so it resumes afterwards. Nothing changes until you choose [[Publish]].",
          },
        ],
      },
    ],
  },
  {
    id: "offline",
    title: "Offline",
    icon: "WifiOff",
    questions: [
      {
        id: "offline-playback",
        q: "Does my screen keep playing when the internet drops?",
        blocks: [
          {
            p: "Yes, for what it has saved. While online, a screen saves the files of the playlist it is playing. Offline it keeps playing that playlist until its end time and skips any item that isn't saved. Apps show their last data.",
          },
          {
            p: "When the internet comes back, the screen picks up changes on its own.",
          },
          {
            tip: "A playlist has to play once on the screen while it is online, so its files are saved. Only then can it play offline.",
          },
        ],
      },
      {
        id: "storage-and-quality",
        q: "Why can't a screen save all my videos, and why might one look softer?",
        blocks: [
          {
            p: "A browser decides how much a website may store, and some TV browsers allow very little, sometimes only tens of megabytes. Images and apps are small; videos fill the space first.",
          },
          {
            p: "A screen with little room saves apps first, then images, then videos from the smallest up. It plays videos at a lower quality (up to 480p) so more fit, which can look softer. A video that still doesn't fit is skipped while the screen is offline. Screens with plenty of room use the original.",
          },
        ],
      },
      {
        id: "screen-storage",
        q: "How do I see how much room a screen has?",
        blocks: [
          {
            p: "Open [[Player]] and pick the screen. Under its connection details, [[Browser]] and [[Offline storage]] show how much it may use and how many of the files it needs are saved, with a hint if anything is missing. For an offline screen they show the last figures it reported.",
          },
        ],
      },
    ],
  },
  {
    id: "account",
    title: "Account and support",
    icon: "CircleUser",
    questions: [
      {
        id: "stay-signed-in",
        q: "What does “Stay signed in” do, and why was I signed out?",
        blocks: [
          {
            p: "For your security a session lasts 30 minutes. While you are working it renews quietly. If you have been idle, a box appears 5 minutes before it ends.",
          },
          {
            p: "Choose [[Stay signed in]] there to keep going. If you miss it, you are signed out and need to sign in again.",
          },
        ],
      },
      {
        id: "feedback",
        q: "How do I send feedback, and how many messages can I send?",
        blocks: [
          {
            p: "Open [[Feedback]] from the account menu (on a phone) or the side menu. Each account can send 5 messages in total; the page shows how many are left.",
          },
          { p: "Emailing hello@castwise.site never uses a message." },
        ],
      },
      {
        id: "screen-details",
        q: "A screen misbehaves. How do I send you its details?",
        blocks: [
          {
            steps: [
              "Open [[Player]] and pick the screen. It must be online.",
              "Choose [[Pull logs]] and confirm. A .zip with the screen's recent log and browser details is saved on the device you are using.",
              "Email the zip to hello@castwise.site with the screen's name and what went wrong.",
            ],
          },
          {
            tip: "Only you can pull a screen's logs, and we see them only if you email them. The log can include names of your playlists and settings of your apps, so look through it first if that matters to you.",
          },
        ],
      },
      {
        id: "contact",
        q: "How do I contact you?",
        blocks: [
          {
            p: "Email hello@castwise.site. We are here every day, 8 AM to 6 PM IST. If you are signed in you can also send Feedback from inside the app.",
          },
        ],
      },
    ],
  },
];

// Text of a string without its [[ ]] marks.
export const plain = (s) => s.replace(/\[\[|\]\]/g, "");

// One question's answer as plain text (for search and for the FAQPage data).
export function answerText(question) {
  return question.blocks
    .map((b) => {
      if (b.p) return plain(b.p);
      if (b.tip) return plain(b.tip);
      if (b.steps) return b.steps.map(plain).join(" ");
      if (b.ul) return b.ul.map(plain).join(" ");
      if (b.table) return b.table.map((r) => r.join(": ")).join(". ");
      return "";
    })
    .join(" ");
}

// Used by: pages/Help.jsx and the files in pages/help/.
