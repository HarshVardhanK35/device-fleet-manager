// The Terms of Use, Acceptable Use rules and Privacy Policy, as data: pages/Legal.jsx draws whichever one
// the route asks for. Plain words, written for a customer. A draft to be read by the owner before it is
// published; it is not legal advice.
//
// Blocks: { p } paragraph, { ul } bullet list. `hello@castwise.site` in a string becomes the copyable address.
// Rule for the wording: it names no outside company or service, and says only what the app really does
// (the app has no "delete my account" button: deletion is by email, so the text says so).
export const LEGAL_UPDATED = "13 November 2026";
export const LEGAL_ORDER = ["terms", "acceptable-use", "privacy"];

export const LEGAL_DOCS = {
  terms: {
    path: "/terms",
    title: "Terms of Use",
    short: "Terms",
    intro:
      "These Terms of Use explain the rules for using CastWise, a service that lets you show images, videos and small apps on your own screens. By creating an account or using CastWise you agree to these Terms, to the Acceptable Use rules and to the Privacy Policy.",
    sections: [
      {
        heading: "Who we are",
        blocks: [
          { p: "These Terms are between you and CastWise (“we”, “us”), the service at castwise.site. You can reach us every day, 8 AM to 6 PM IST, at hello@castwise.site." },
        ],
      },
      {
        heading: "Your account",
        blocks: [
          { p: "You must be at least 18 years old, or use CastWise with the permission of a parent or guardian." },
          {
            ul: [
              "Give correct information when you sign up and keep it up to date.",
              "One account is for one person. Keep your password safe: you are responsible for what happens under your account.",
              "Tell us at once if someone else has used your account.",
              "Each account has limits, such as the number of screens, images and video storage. They are shown in the Help page and can change.",
            ],
          },
        ],
      },
      {
        heading: "Using CastWise",
        blocks: [
          { p: "CastWise is for managing and showing content on screens that you control or are allowed to use. You agree to follow the Acceptable Use rules, not to interfere with the service or other people's accounts, and not to try to get around its limits or checks." },
        ],
      },
      {
        heading: "Your content",
        blocks: [
          { p: "Your content stays yours. You give us permission to store, process and show it, only so we can run CastWise for you, for example to show it on your screens." },
          { p: "You promise that you have the right to use what you upload, and that it follows the Acceptable Use rules. We may run automated checks, and we may block or remove content that breaks the rules." },
        ],
      },
      {
        heading: "The service",
        blocks: [
          { p: "CastWise is free, and we do not plan to charge for it. Every account can connect up to 3 screens at no cost. If you need more, write to us at hello@castwise.site and we will look at raising your limit." },
          { p: "CastWise is provided “as is”. We work to keep it available, but we do not promise that it will always work without interruption, or that every screen or browser will play every file. Screens keep playing offline only what they have already saved. We may change, pause or end features, and we will try to tell you about big changes." },
        ],
      },
      {
        heading: "Limits of our responsibility",
        blocks: [
          { p: "As far as the law allows, we are not responsible for indirect or knock-on losses, such as lost business or profit, that come from using CastWise or from it not working. Nothing in these Terms limits any right you have by law that cannot be limited." },
        ],
      },
      {
        heading: "Ending your account",
        blocks: [
          { p: "You can stop using CastWise at any time. To delete your account and everything in it, email hello@castwise.site from the address you sign in with, and we will delete it within 3 days." },
          { p: "We may suspend or delete an account that breaks these Terms or the Acceptable Use rules, or that puts the service or other people at risk. When an account ends, its content is deleted." },
        ],
      },
      {
        heading: "Changes to these Terms",
        blocks: [
          { p: "We may update these Terms. The date at the top of the page shows when they last changed. If you keep using CastWise after a change, you accept the new Terms." },
        ],
      },
      {
        heading: "Governing law",
        blocks: [
          { p: "These Terms are governed by the laws of India, and the courts of competent jurisdiction in India decide any dispute about them. If you use CastWise from another country, you agree to this too." },
        ],
      },
    ],
  },

  "acceptable-use": {
    path: "/acceptable-use",
    title: "Acceptable Use rules",
    short: "Acceptable use",
    intro:
      "CastWise shows your content on screens that other people may see, in shops, offices, waiting rooms and other public places. These rules keep it safe for everyone.",
    sections: [
      {
        heading: "What you must not upload, show or share",
        blocks: [
          {
            ul: [
              "Content that is illegal in India or in the place where it is shown.",
              "Content that is obscene or indecent.",
              "Content that exploits or endangers children in any way.",
              "Content that is hateful, threatening or harassing, or that promotes violence or self-harm.",
              "Content that infringes someone else's copyright, trademark or privacy, or shows people without the right to do so.",
              "Content that is false or misleading in a way that could harm others, or that pretends to be another person or business.",
              "Files or apps that contain malware or try to harm devices or accounts.",
            ],
          },
        ],
      },
      {
        heading: "What you must not do",
        blocks: [
          {
            ul: [
              "Get around the limits or the content checks of CastWise.",
              "Overload, attack or interfere with the service.",
              "Use someone else's account or screens, or try to get into them.",
              "Create accounts in bulk or with automated tools.",
            ],
          },
        ],
      },
      {
        heading: "Checks and removal",
        blocks: [
          { p: "Files may be checked automatically before they are uploaded, and a file that does not pass is not uploaded. The checks are not perfect and you stay responsible for what you upload." },
          { p: "We may remove content, suspend an account or delete it if these rules are broken, without warning when the case is serious. We may share information with the authorities where the law requires it." },
        ],
      },
      {
        heading: "Reporting a problem",
        blocks: [
          { p: "If you see content on CastWise that breaks these rules, email hello@castwise.site with what you saw and where. We look at every report and act where it is right to do so." },
        ],
      },
    ],
  },

  privacy: {
    path: "/privacy",
    title: "Privacy Policy",
    short: "Privacy",
    intro:
      "This policy explains what information CastWise keeps about you, why it keeps it, and what you can do about it.",
    sections: [
      {
        heading: "What we keep",
        blocks: [
          {
            ul: [
              "Account details: your name, username, email address and your password in protected form.",
              "Your screens: their names, types and when they were last online.",
              "Your content: your files, your playlists and schedules, and what you set up in your apps.",
              "Messages you send us, in Feedback or by email.",
              "Technical details of a screen, only if you choose to download its log and send it to us.",
              "Things kept in your own browser: a sign-in cookie and your light or dark choice.",
            ],
          },
        ],
      },
      {
        heading: "Why we keep it",
        blocks: [
          { p: "To run CastWise: to sign you in, to show your content on your screens, to keep your account secure, to answer your messages and to improve the service. We do not sell your information." },
        ],
      },
      {
        heading: "How we store it",
        blocks: [
          { p: "We store the content and information you add to CastWise, such as your account details, screens, playlists and files, so we can show them on your screens. We keep them until you delete them or your account." },
          { p: "We use service providers to run CastWise, for example for hosting, storage and email. They handle your information only to provide those services to us." },
        ],
      },
      {
        heading: "Who we share it with",
        blocks: [
          { p: "Only with the service providers above, when the law requires it, or when it is needed to protect people or the service. We do not use advertising or tracking cookies." },
        ],
      },
      {
        heading: "Keeping it safe",
        blocks: [
          { p: "We use reasonable measures to protect your information, such as encrypted connections and protected passwords. No service can be completely secure, so we cannot promise that nothing will ever go wrong." },
        ],
      },
      {
        heading: "Deleting your information",
        blocks: [
          { p: "You can delete your content in CastWise at any time, and it is then removed from our storage as well." },
          { p: "To delete your account, email hello@castwise.site from the address you sign in with. Within 3 days we delete your account, screens, playlists, content and messages." },
        ],
      },
      {
        heading: "Your choices",
        blocks: [
          { p: "You can ask us what we keep about you, ask us to correct it, or ask us to delete it, by emailing hello@castwise.site. These promises apply to everyone who uses CastWise, wherever they live." },
        ],
      },
      {
        heading: "Children",
        blocks: [{ p: "CastWise is not meant for children under 18, and we do not knowingly collect their information." }],
      },
      {
        heading: "Changes and contact",
        blocks: [
          { p: "We may update this policy; the date at the top of the page shows when it last changed. Questions about your privacy: hello@castwise.site." },
        ],
      },
    ],
  },
};

// Used by: pages/Legal.jsx, pages/Register.jsx, pages/landing/LandingFooter.jsx.
