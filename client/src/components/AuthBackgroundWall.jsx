const TH = {
  dark: "linear-gradient(180deg,#1a1c22,#0e0f13)",
  post: "repeating-linear-gradient(180deg,#141519 0 3px,#4a4d57 3px 4px)",
  pink: "linear-gradient(170deg,#c22d9b,#e2468a 60%,#f08a4b)",
  info: "linear-gradient(180deg,#0c0c10 0 25%,#f3f0ea 25% 70%,#0c0c10 70%)",
  doc: "linear-gradient(90deg,#16171c 0 40%,#f4f4f6 40% 60%,#16171c 60%)",
  aurora:
    "radial-gradient(ellipse 70% 35% at 50% 45%,rgba(40,220,160,.75),transparent 70%),linear-gradient(180deg,#04080f,#0b2230)",
  sky: "radial-gradient(circle at 75% 25%,#fffbe8 0 10%,transparent 30%),linear-gradient(180deg,#2f5fa8 0%,#8fb4e0 70%,#0b1410 70%)",
};
const POOL = ["post", "post", "info", "doc", "pink", "dark", "info", "post", "doc", "pink"];
const pickThumbs = (seed, n) =>
  Array.from({ length: n }, (_, j) => ({ bg: TH[POOL[(seed * 7 + j * 3) % POOL.length]] }));

const KINDS = ["dash", "content", "assign", "playlist", "off", "content", "playlist", "dash"];
const WALL_TILES = Array.from({ length: 28 }, (_, i) => {
  const k = KINDS[(i * 3 + Math.floor(i / 4)) % KINDS.length];
  const off = k === "off";
  return {
    dash: k === "dash",
    content: k === "content",
    assign: k === "assign" || off,
    playlist: k === "playlist",
    live: !off,
    off,
    dot: off ? "#4a4e5c" : "#3fbf7f",
    pill: off ? "rgba(240,178,62,.35)" : "rgba(63,191,127,.3)",
    selA: off ? "#2a2d38" : "#2f6fe0",
    selB: off ? "#2f6fe0" : "#2a2d38",
    stats: [
      ["#cfd3e5", "#4a4e5c"],
      ["#3fbf7f", "#3fbf7f"],
      ["#cfd3e5", "#ef5a5a"],
      ["#cfd3e5", "#4a4e5c"],
      ["#cfd3e5", "#4a4e5c"],
    ].map(([num, dot]) => ({ num, dot })),
    thumbs:
      k === "playlist"
        ? [TH.pink, TH.aurora, TH.post, TH.sky, TH.doc].map((bg) => ({ bg }))
        : pickThumbs(i, k === "content" ? 15 : 8),
  };
});

function DashBody({ stats, thumbs }) {
  return (
    <>
      <span style={{ width: "22%", height: "5%", borderRadius: 2, background: "#cfd3e5", opacity: 0.7 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "3%", height: "18%" }}>
        {stats.map((t, i) => (
          <div key={i} style={{ position: "relative", background: "#171a24", border: "1px solid #2a2d38", borderRadius: 4 }}>
            <span style={{ position: "absolute", left: "12%", top: "45%", width: "22%", height: "24%", borderRadius: 2, background: t.num }} />
            <span style={{ position: "absolute", right: "10%", top: "14%", width: "9%", aspectRatio: "1", borderRadius: "50%", background: t.dot }} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3%" }}>
        <div style={{ background: "#171a24", border: "1px solid rgba(239,90,90,.3)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: "12%", aspectRatio: "1", borderRadius: "50%", border: "2px solid #3fbf7f", background: "rgba(63,191,127,.15)" }} />
        </div>
        <div style={{ background: "#171a24", border: "1px solid #2a2d38", borderRadius: 4, padding: "5%", display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "5%" }}>
          {thumbs.slice(0, 8).map((t, i) => (
            <div key={i} style={{ background: t.bg, borderRadius: 3 }} />
          ))}
        </div>
      </div>
    </>
  );
}

function ContentBody({ thumbs }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", height: "7%" }}>
        <span style={{ width: "22%", borderRadius: 2, background: "#cfd3e5", opacity: 0.7 }} />
        <span style={{ width: "30%", borderRadius: 3, border: "1px solid #2a2d38" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "2%", height: "7%" }}>
        <span style={{ width: "12%", borderRadius: 3, border: "1px solid #2a2d38" }} />
        <span style={{ width: "12%", borderRadius: 3, background: "#2f6fe0" }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "3%" }}>
        {thumbs.slice(0, 15).map((t, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6%", background: "#171a24", border: "1px solid #2a2d38", borderRadius: 4, padding: "6%" }}>
            <div style={{ flex: 1, background: t.bg, borderRadius: 3 }} />
            <span style={{ width: "70%", height: "7%", borderRadius: 2, background: "#5a5e6c" }} />
            <span style={{ width: "30%", height: "7%", borderRadius: 2, background: "rgba(61,130,246,.6)" }} />
          </div>
        ))}
      </div>
    </>
  );
}

function AssignBody({ selA, selB, dot, pill, live, off }) {
  return (
    <>
      <span style={{ width: "22%", height: "5%", borderRadius: 2, background: "#cfd3e5", opacity: 0.7 }} />
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 2.2fr", gap: "4%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6%" }}>
          <div style={{ height: "24%", borderRadius: 4, background: "#171a24", border: `1px solid ${selA}`, display: "flex", alignItems: "center", gap: "8%", padding: "0 8%" }}>
            <span style={{ width: "7%", aspectRatio: "1", borderRadius: "50%", background: "#3fbf7f" }} />
            <span style={{ width: "50%", height: "14%", borderRadius: 2, background: "#6a6e7c" }} />
          </div>
          <div style={{ height: "24%", borderRadius: 4, background: "#171a24", border: `1px solid ${selB}`, display: "flex", alignItems: "center", gap: "8%", padding: "0 8%" }}>
            <span style={{ width: "7%", aspectRatio: "1", borderRadius: "50%", background: "#4a4e5c" }} />
            <span style={{ width: "50%", height: "14%", borderRadius: 2, background: "#6a6e7c" }} />
          </div>
        </div>
        <div style={{ borderRadius: 5, background: "#151822", border: "1px solid #2a2d38", padding: "5%", display: "flex", flexDirection: "column", gap: "6%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", height: "12%" }}>
            <span style={{ width: "30%", borderRadius: 2, background: "#8a8e9c" }} />
            <span style={{ width: "20%", borderRadius: 3, background: "#2f6fe0" }} />
          </div>
          <span style={{ width: "16%", height: "8%", borderRadius: 6, border: `1px solid ${dot}` }} />
          <div style={{ flex: 1, borderRadius: 4, border: "1px solid #2a2d38", background: "#12141c", padding: "5%", display: "flex", flexDirection: "column", gap: "10%" }}>
            <span style={{ width: "20%", height: "12%", borderRadius: 6, background: pill }} />
            <span style={{ width: "40%", height: "10%", borderRadius: 2, background: "#8a8e9c" }} />
            {live && (
              <div style={{ height: "6%", borderRadius: 3, background: "#2a2d38", overflow: "hidden" }}>
                <div style={{ width: "18%", height: "100%", background: "#3fbf7f" }} />
              </div>
            )}
            {off && (
              <div style={{ height: "22%", borderRadius: 3, background: "rgba(240,178,62,.12)", border: "1px solid rgba(240,178,62,.4)" }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PlaylistBody({ thumbs }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 2.6fr", gap: "4%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6%", paddingTop: "4%" }}>
        <div style={{ height: "16%", borderRadius: 4, background: "#171a24", border: "1px solid #2f6fe0", boxShadow: "inset 2px 0 0 #2f6fe0" }} />
        <div style={{ height: "16%", borderRadius: 4, background: "#171a24", border: "1px solid #2a2d38" }} />
        <div style={{ height: "16%", borderRadius: 4, background: "#171a24", border: "1px solid #2a2d38" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", height: "8%" }}>
          <span style={{ width: "34%", borderRadius: 2, background: "#cfd3e5", opacity: 0.7 }} />
          <span style={{ width: "22%", borderRadius: 3, background: "#2f6fe0" }} />
        </div>
        <div style={{ height: "40%", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "3%" }}>
          {thumbs.slice(0, 5).map((t, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6%", background: "#171a24", border: "1px solid #2a2d38", borderRadius: 4, padding: "5%" }}>
              <div style={{ flex: 1, background: t.bg, borderRadius: 3 }} />
              <span style={{ width: "70%", height: "8%", borderRadius: 2, background: "#5a5e6c" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WallTile(t) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16/10",
        borderRadius: 10,
        overflow: "hidden",
        background: "#0f1117",
        border: "1px solid #2c2f3b",
        boxShadow: "0 12px 32px rgba(0,0,0,.55)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: "none", height: "9%", display: "flex", alignItems: "center", gap: "5%", padding: "0 4%", background: "#161925", borderBottom: "1px solid #22252f" }}>
        <span style={{ width: "4%", aspectRatio: "1", borderRadius: 3, background: "#2f6fe0" }} />
        <span style={{ width: "7%", height: "22%", borderRadius: 2, background: "#4a4e5c" }} />
        <span style={{ width: "7%", height: "22%", borderRadius: 2, background: "#3a3d48" }} />
        <span style={{ width: "7%", height: "22%", borderRadius: 2, background: "#3a3d48" }} />
        <span style={{ width: "7%", height: "22%", borderRadius: 2, background: "#3a3d48" }} />
        <span style={{ marginLeft: "auto", width: "3.5%", aspectRatio: "1", borderRadius: "50%", background: "#2a2d38" }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: "4% 9%", display: "flex", flexDirection: "column", gap: "5%" }}>
        {t.dash && <DashBody stats={t.stats} thumbs={t.thumbs} />}
        {t.content && <ContentBody thumbs={t.thumbs} />}
        {t.assign && <AssignBody selA={t.selA} selB={t.selB} dot={t.dot} pill={t.pill} live={t.live} off={t.off} />}
        {t.playlist && <PlaylistBody thumbs={t.thumbs} />}
      </div>
    </div>
  );
}

function AuthBackgroundWall() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block"
      style={{ background: "#0d0e16", perspective: 1600 }}
    >
      <div
        style={{
          position: "absolute",
          left: "-28%",
          top: "-38%",
          width: "156%",
          display: "grid",
          gridTemplateColumns: "repeat(4,minmax(0,1fr))",
          gap: 20,
          transform: "rotateX(20deg) rotateZ(-8deg)",
          transformOrigin: "50% 0",
        }}
      >
        {WALL_TILES.map((t, i) => (
          <WallTile key={i} {...t} />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 45%, rgba(13,14,22,.4) 0%, rgba(13,14,22,.75) 70%, rgba(13,14,22,.92) 100%), linear-gradient(180deg, rgba(13,14,22,.7) 0%, rgba(13,14,22,.2) 30%, rgba(13,14,22,.3) 65%, rgba(13,14,22,.92) 100%)",
        }}
      />
    </div>
  );
}

export default AuthBackgroundWall;

// Decorative background for the auth pages — the selected Claude Design
// mock "DFM-Auth-1a"'s own 28-tile wall of code-built DFM screen mockups
// (dashboard/content/assignments/playlist variants, percentage-sized so
// they scale with viewport), tilted via rotateX/rotateZ, with the mock's
// dark scrim gradient on top for legibility. Pure decoration — no props,
// no real data.
// Used by: components/AuthLayout.jsx.