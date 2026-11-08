# CastWise

Free digital signage for any screen. Put images, videos, notices and small live "apps" (weather, clock, news, announcements) on any TV, tablet or phone that has a browser, schedule them by screen and time window, and see which screens are online.

Live at **https://castwise.site** · Current version: **1.4.1**

> The repository and some internal names still say "Device Fleet Manager" / "DFM" (the original working name). Everything a user sees says CastWise and "screens".

## What it does

- **Content library** — upload images and videos (Cloudinary), or add apps; each item has a name and a display duration.
- **Playlists** — an ordered list of content. An image can appear up to 3 times in a playlist, anything else once.
- **Assignments** — publish a playlist to one or more screens for a time window; conflicts with existing schedules are shown and can be overridden.
- **Screens** — pair a TV or any browser with an 8-character code; screens show what is scheduled, rotate through the playlist and report a heartbeat. Up to 3 screens per account. A screen keeps playing when its internet drops (see Offline screens). From the Player page you can preview a screen, **take it over** (its physical screen disconnects, and the page keeps showing "Release screen" until you release it) and **refresh** it.
- **Apps** — Weather, Clock, Media RSS and Announcements (Rotating Notices, Status List, Event Cards), each configured in a settings screen with a live preview.
- **Refresh screen** — a screen's menu on the Player page restarts its playlist from the first item, only while the screen is online and at most once a minute per screen. It does not reload the page, so the screen stays in fullscreen.
- **Dashboard** — screen status, recently created content, usage against the account limits.
- **Feedback** — a signed-in user sends the admin up to 5 messages (issue, suggestion or other) from the Feedback page and sees the answer there.
- **Admin** — an admin-only Users page (list, a user's screens by name and status, delete user) and an Inbox for feedback: the admin answers each message once, with a status (Noted or Not planned) and one reply. Admins never see anyone's content or playlists.
- **Landing page** at `/` for signed-out visitors, with a live demo, a section on offline playback and a footer with the project's profiles.
- **Notifications** — short toast messages at the bottom right confirm actions (for example "Refresh sent to Lobby").

## How it works

```
Browser (React)  <--REST/HTTPS-->  Server (Express)  <--Mongoose-->  MongoDB
       |                                 |
       +----------- MQTT (WebSocket) ----+   via an MQTT broker (EMQX Cloud)
```

`Content` → `Playlist` → `Assignment` (playlist + screen + schedule) → **manifest composer** (one JSON manifest per screen) → published over MQTT (retained) → the player page subscribes and renders it. Each screen also publishes a heartbeat every 10 seconds; a screen is marked offline after 20 seconds without one.

Auth: a 15-minute access token kept in memory and a refresh token in an `httpOnly` cookie; a warning opens 5 minutes before the session ends, with Stay signed in and Sign out now. Screens are addressed by a long random access token, never by their database id.

## Offline screens

A screen keeps working when its internet drops. It needs one online run first, so it can save its files.

- **What is saved** — the player page itself (a service worker, `client/public/player-sw.js`), the last manifest, and the files of the playlist that is playing: images, videos, app bundles and the images inside apps. Smallest files go first, small ones in parallel; a file is kept only if it arrived whole; files nothing uses any more are deleted; the browser is asked to keep the storage.
- **While online** — a saved file plays from the saved copy, anything else plays from the network while a copy is saved in the background.
- **When the connection drops** — the screen keeps playing the playlist it was on until that playlist's end time (never the next one), skips any item whose file is not saved, shows a pulsing OFFLINE strip (it appears a minute after the drop, then for 10 seconds every minute while the screen stays offline), and after the end time shows "Nothing scheduled" with a check-your-connection line. A screen that restarts with no internet does the same from the saved manifest.
- **When it reconnects** — it takes the live manifest; an updated playlist restarts from the beginning, an unchanged one keeps playing.
- **App data** — Weather, RSS and the other apps keep showing their last data when the network fails (`@castwise/ignition` 1.4.0).

The code is in `client/src/offline/` and `client/src/components/screens/DevicePlayback.jsx`. To try it, use a production build (`npm run build` then `npm run preview`) or staging, let a screen play, then switch the network off in DevTools.

## Repositories

| Folder / repo | What it is |
|---|---|
| `device-fleet-manager/` (this repo) | `client/` (React) and `server/` (Express) |
| `ignition/` | `@castwise/ignition`, the small runtime every app is built on |
| `castwise-apps/{weather,clock,rss,announcements}` | the app widgets (Vue 3 + Vite, built to one HTML file and loaded in an iframe) |

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), MQTT, Cloudinary (media), Resend (email)
- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Radix UI
- **Delivery:** MQTT over WebSocket (EMQX Cloud, one deployment shared by staging and prod, kept apart by a topic prefix; any broker with a WebSocket listener works locally)
- **Hosting:** Render (staging and prod), GitHub Actions for builds and releases, Namecheap for the domain

## Running locally

Prerequisites: Node.js 18+, npm, a MongoDB connection string (e.g. Atlas), an MQTT broker with a WebSocket listener (for example a local [Mosquitto](https://mosquitto.org/) on port `1883` plus a WebSocket port such as `9001`, or an EMQX Cloud deployment).

### Server

```bash
cd server
npm install
npm run dev
```

`server/.env` needs:

```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=<mongodb connection string>
JWT_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
MQTT_URL=<broker url, e.g. mqtt://localhost:1883>
MQTT_TOPIC_PREFIX=<optional, e.g. stg/ so environments can share one broker>
TRUST_PROXY_HOPS=<optional, default 1; 5 when the frontend forwards /api to the backend (see Deployment)>
MQTT_USERNAME=<optional>
MQTT_PASSWORD=<optional>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
RESEND_API_KEY=<key, for verification and reset emails>
```

The first admin account is made by registering normally and changing `role` to `admin` on that user in the database (registration never accepts a role).

### Client

```bash
cd client
npm install
npm run dev
```

`client/.env` (all optional locally):

```
VITE_API_BASE=http://localhost:5000
VITE_MQTT_WS_URL=<broker WebSocket url>
VITE_MQTT_TOPIC_PREFIX=<optional, must match the server's MQTT_TOPIC_PREFIX>
VITE_MQTT_USERNAME=<optional>
VITE_MQTT_PASSWORD=<optional>
VITE_MAPBOX_TOKEN=<token for the location search in the Weather and Clock settings>
VITE_APP_ENV=<staging on the staging build>
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

### Apps in development

Each app lives in its own repo under `castwise-apps/`. Run its `npm run dev` and set its `devUrl` in `client/src/apps/appsRegistry.json` so the client loads the local copy. Deployed builds use the zip URLs in the same file (`stagingZipUrl`, `prodZipUrl`).

### Simulating a screen without a browser

```bash
cd server
node services/deviceSimulator.js <deviceId>
```

Subscribes to that screen's manifest topic, logs what arrives and sends heartbeats.

## Deployment

Two environments, each with a frontend (static site) and a backend on Render, sharing one EMQX Cloud MQTT broker (staging topics start with `stg/`, set by `MQTT_TOPIC_PREFIX` on the backend and `VITE_MQTT_TOPIC_PREFIX` on the frontend; prod uses its own broker login and no prefix):

- **Staging** — `staging.castwise.site`, built from every push to `master`; sends `X-Robots-Tag: noindex` so search engines skip it.
- **Production** — `castwise.site`, promoted by pushing a `v*` tag, which copies the already-built, already-tested artifact (no rebuild).

**API through the frontend:** on both sites the frontend forwards `/api/*` to its backend (a Render rewrite rule placed above the catch-all `/*` to `/index.html` rule) and is built with `VITE_API_BASE=https://<site>/api`, so the browser only talks to its own site. That keeps the refresh cookie (`SameSite=Strict`) working, which is what "Stay signed in" and the silent renewal need. The backend then runs with `TRUST_PROXY_HOPS=5` (the client, Cloudflare twice and two Render addresses sit in front of it), so the rate limits count each client's own address.

Staging and prod use separate databases. The app repos publish their own zips the same way (a `staging` release on every push, a `prod` release on a version tag).

## Recent releases

- **1.4.1** — prod moves to EMQX Cloud (one deployment shared with staging, kept apart by a topic prefix; Mosquitto removed), the API is served through each frontend so "Stay signed in" works on the deployed sites, the rate limits count each client's real address (`TRUST_PROXY_HOPS`), **Skip** for playlist items (kept in the playlist, not played; `skippedItems`), the item details panel opens from a playlist, a green ONLINE strip when a screen reconnects, toast notifications for every save, add and delete, the session warning opens only for an idle user (an active one is renewed quietly), a collapsible list on the Playlists, Assignments and Player pages (desktop), a playlist summary on assignment cards, Media RSS explains its duration, items sort by last edit, background audio shown as coming soon, icon-only Refresh buttons, a tidier Player page (refresh in the list, hints with bulb icons, shorter take-over text on small screens), and the Playlists page split into a hook and components.
- **1.4.0** — Feedback (user page and an admin Inbox where each message gets one answer, Noted or Not planned), a warning before the session ends, the reworked `/screens` pairing page (current name, refresh icon, code-limit counter), offline screens (saved files and manifest, offline rules, OFFLINE strip) with `@castwise/ignition` 1.4.0 for app data, **Refresh screen** and a take-over state that survives leaving the page, toast notifications, a landing page with an Offline section and a four-column footer, and a code reorganisation (`apps/shared` folders; the player, `/screens` and Player pages split into hooks and components).
- **1.3.1** — favicon PNGs and `favicon.ico` for Google, icon thumbnails for apps (Content, Playlists, Dashboard, pickers, Player), `hello@castwise.site` as the public address, LinkedIn / GitHub / X links in the landing footer.
- **1.3.0** — search engine basics (title, description, canonical, share tags, `robots.txt`, `sitemap.xml`), "Free for up to 3 screens" on the landing page, images on screens appear whole (preloaded, screen-size copies), playlist duplicate rule, Edit playlist works as a draft until Save, several mobile layout fixes.
- **1.2.0** — admin Users page, usernames for new accounts, Cloudinary size checks before upload, app editor mobile header, Content details panel as a floating panel on desktop.
