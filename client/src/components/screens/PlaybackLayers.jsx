import { useEffect, useRef, useState } from "react";

import AppRenderer from "../../apps/shared/playback/AppRenderer.jsx";
import { logEvent, logWarn } from "../../utils/screenLog/screenLog.js";
import { readSavedBlob } from "../../offline/mediaCache.js";
import { itemKey, screenImageUrl, toLowQuality, toWebm, videoUrl } from "../../offline/playlistItems.js";
import { isLowStorage } from "../../offline/storageMode.js";
import ScreenImage from "./ScreenImage.jsx";
import { nextPlayableIndex } from "./playbackRules.js";

// What a <video> says about itself, for the console: its error code, ready and network
// state and whether this browser claims it can play MP4 (H.264) and WebM. A Chromium
// build without proprietary codecs (the snapshot builds used for testing) cannot play
// H.264 MP4 at all.
const MEDIA_ERRORS = { 1: "aborted", 2: "network", 3: "decode", 4: "source not supported" };
function logVideo(event, video) {
  console.log(`[video] ${event}`, {
    name: video.dataset.name,
    src: video.currentSrc,
    error: video.error ? `${video.error.code} ${MEDIA_ERRORS[video.error.code] || ""} ${video.error.message || ""}`.trim() : null,
    readyState: video.readyState,
    networkState: video.networkState,
    canPlayMp4: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') || "no",
    canPlayWebm: video.canPlayType('video/webm; codecs="vp9, opus"') || "no",
  });
}

// Waiting behind the item on screen: laid out at full size (so it really loads and
// measures itself) but not drawn and not clickable.
const WAITING = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  visibility: "hidden",
  pointerEvents: "none",
};

// Images already asked for, kept so the browser does not drop the decoded copy
// before its turn. Only the last few are kept.
const preloadedImages = [];
function preloadImage(url) {
  const img = new Image();
  img.onload = () => logEvent("image", `Next image loaded ahead of its turn: ${url.slice(-70)}`);
  img.onerror = () => logWarn("image", `Next image could not be loaded ahead of its turn: ${url.slice(-70)}`);
  img.src = url;
  if (img.decode) img.decode().catch(() => {});
  preloadedImages.push(img);
  if (preloadedImages.length > 3) preloadedImages.shift();
}

// How an item fills the screen: its own setting, otherwise images fill and videos show whole.
const fitOf = (item) => item.fit || (item.type === "image" ? "cover" : "contain");

function VideoLayer({ item, current, online, savedKeys, pendingVideoSeek, onSeekApplied, onVideoElement, onFailed }) {
  const ref = useRef(null);
  // Videos this browser refused as MP4 (error 4, source not supported): played as WebM instead.
  const [asWebm, setAsWebm] = useState(false);
  // Low-storage mode plays a 480p copy; if that copy cannot be made or played, the original is used.
  const [useOriginal, setUseOriginal] = useState(false);
  // False once this layer is gone: a browser reports a read error for a video it was
  // still downloading when the element was removed, which is not a real problem.
  const mounted = useRef(false);
  const retries = useRef(0);
  const loggedPlaying = useRef(false);
  const failed = useRef(false);
  const plainSrc = asWebm
    ? toWebm(useOriginal || !isLowStorage() ? item.mediaUrl : toLowQuality(item.mediaUrl))
    : videoUrl(item.mediaUrl, useOriginal);

  // A TV browser's video player asks for the file by itself and never goes through the service
  // worker, so offline it cannot reach the saved copy. Offline (or when the network copy fails)
  // the saved file is read from storage and played from memory instead.
  const key = itemKey(item);
  const saved = key !== null && savedKeys.has(key);
  const [forceSaved, setForceSaved] = useState(false);
  const [blob, setBlob] = useState({ url: null, failed: false });
  const blobUrl = useRef(null);
  const wantBlob = (!online || forceSaved) && saved && !blob.failed;
  const src = wantBlob ? blob.url ?? undefined : plainSrc;

  useEffect(() => {
    if (!wantBlob || blob.url) return undefined;
    let cancelled = false;
    readSavedBlob(key)
      .then((file) => {
        if (cancelled) return;
        if (!file) {
          logWarn("video", `The saved copy of "${item.name}" could not be read from storage`);
          setBlob({ url: null, failed: true });
          return;
        }
        blobUrl.current = URL.createObjectURL(file);
        logEvent("video", `Playing "${item.name}" from the saved copy in storage (${(file.size / 1048576).toFixed(1)} MB)`);
        setBlob({ url: blobUrl.current, failed: false });
      })
      .catch(() => {
        if (!cancelled) setBlob({ url: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [wantBlob, blob.url, key, item.name]);

  useEffect(
    () => () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    [],
  );

  // Nothing more to try: tell the player so it skips this item and plays the next one.
  function giveUp(reason) {
    if (failed.current) return;
    failed.current = true;
    logWarn("video", `"${item.name}" cannot be played (${reason}); skipping it`);
    onFailed();
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The next video is loaded and held on its first frame; it starts when its turn comes.
  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    if (!current) {
      video.pause();
      return undefined;
    }
    onVideoElement(video);
    if (!src) return () => onVideoElement(null); // the saved copy is still being read
    const started = video.play();
    if (started && started.catch) started.catch((err) => console.log("[video] play() refused", err.name));
    return () => onVideoElement(null);
  }, [current, onVideoElement, src]);

  return (
    <video
      ref={ref}
      src={src}
      preload="auto"
      loop
      muted
      playsInline
      data-name={item.name}
      onLoadStart={(e) => logVideo("load start", e.currentTarget)}
      onLoadedData={(e) => logVideo("first frame ready", e.currentTarget)}
      onPlaying={(e) => {
        // fires again after every loop and every stall: logged only the first time
        if (loggedPlaying.current) return;
        loggedPlaying.current = true;
        logVideo("playing", e.currentTarget);
      }}
      onWaiting={(e) => logVideo("waiting (buffering)", e.currentTarget)}
      onStalled={(e) => logVideo("stalled", e.currentTarget)}
      onError={(e) => {
        const video = e.currentTarget;
        if (!mounted.current) return;
        logVideo("ERROR", video);
        const code = video.error?.code;
        // The saved copy itself stopped: load it again a few times, then give up.
        if (wantBlob && blob.url) {
          if (code === 2 && retries.current < 3) {
            retries.current += 1;
            console.log(`[video] the saved copy stopped, reloading it (${retries.current} of 3)`, item.name);
            setTimeout(() => {
              if (!mounted.current) return;
              video.load();
              if (current) video.play().catch(() => {});
            }, 500);
            return;
          }
          giveUp(`the saved copy failed too: error ${code}; this browser may not be able to play saved videos offline`);
          return;
        }
        // The network copy failed and a saved copy exists: play that.
        if (saved && !wantBlob && !blob.failed) {
          console.log("[video] the network copy failed, trying the saved copy", item.name);
          setForceSaved(true);
          return;
        }
        // A network / read error part-way through (a dropped connection, the saved copy
        // taking over from the download): load it again, a few times at most.
        if (video.error?.code === 2 && retries.current < 3) {
          retries.current += 1;
          console.log(`[video] read error, reloading (${retries.current} of 3)`, item.name);
          setTimeout(() => {
            if (!mounted.current) return;
            video.load();
            if (current) video.play().catch(() => {});
          }, 500);
          return;
        }
        // The small 480p copy could not be played (not made yet, or refused): the original instead.
        if (video.error?.code === 4 && isLowStorage() && !useOriginal && toLowQuality(item.mediaUrl) !== item.mediaUrl) {
          console.log("[video] the 480p copy could not be played, using the original", item.name);
          setUseOriginal(true);
          return;
        }
        // The browser said it could play MP4 but could not: try WebM once.
        if (video.error?.code === 4 && !asWebm && toWebm(item.mediaUrl) !== item.mediaUrl) {
          console.log("[video] retrying as WebM", item.name);
          setAsWebm(true);
          return;
        }
        giveUp(`error ${code}${saved ? "" : ", and it is not saved"}`);
      }}
      onLoadedMetadata={(e) => {
        if (current && pendingVideoSeek != null) {
          e.currentTarget.currentTime = pendingVideoSeek;
          onSeekApplied();
        }
      }}
      style={current ? { width: "100vw", height: "100vh", objectFit: fitOf(item) } : WAITING}
    />
  );
}

function ImageLayer({ item, current, onFailed }) {
  const url = screenImageUrl(item.mediaUrl);
  useEffect(() => {
    if (!current) preloadImage(url);
  }, [current, url]);
  return current ? <ScreenImage url={url} alt={item.name} fit={fitOf(item)} onFailed={onFailed} /> : null;
}

// What is on screen, plus the item that comes next, prepared behind it: a video
// loaded and held on its first frame, an image loaded and decoded, an app loaded and
// waiting for its settings. When the turn comes the prepared item is the same element
// (same key), so it appears at once instead of after a black gap or the loader.
//   turn  goes up each time the playlist moves on, so an item shown again later is
//         a fresh element (a widget starts over) rather than the one left behind
function PlaybackLayers({
  items,
  contentIndex,
  turn,
  assignmentId,
  online,
  savedKeys,
  refreshTick,
  failedKeys,
  pendingVideoSeek,
  onSeekApplied,
  onVideoElement,
  onFailed,
  onAssets,
}) {
  const nextIndex = items.length > 1 ? nextPlayableIndex(items, contentIndex, online, savedKeys, failedKeys) : contentIndex;
  const layers = [{ index: contentIndex, turn, current: true }];
  useEffect(() => {
    if (nextIndex !== contentIndex) {
      logEvent("play", `Preparing the next item behind the current one: ${nextIndex + 1} "${items[nextIndex]?.name}" (${items[nextIndex]?.type})`);
    }
  }, [items, contentIndex, nextIndex]);
  if (nextIndex !== contentIndex) layers.push({ index: nextIndex, turn: turn + 1, current: false });

  return layers.map(({ index, turn: layerTurn, current }) => {
    const item = items[index];
    // A lone image or video keeps one element for good (a video just loops); an app is
    // rebuilt each round.
    const keyTurn = layers.length === 1 && item.type !== "app" ? 0 : layerTurn;
    const key = `${assignmentId}-${index}-${keyTurn}-${refreshTick}`;
    if (item.type === "image") return <ImageLayer key={key} item={item} current={current} onFailed={() => onFailed(item)} />;
    if (item.type === "video") {
      return (
        <VideoLayer
          key={key}
          item={item}
          current={current}
          online={online}
          savedKeys={savedKeys}
          pendingVideoSeek={pendingVideoSeek}
          onSeekApplied={onSeekApplied}
          onVideoElement={onVideoElement}
          onFailed={() => onFailed(item)}
        />
      );
    }
    if (item.type === "app") return <AppRenderer key={key} configBlob={item.configBlob} active={current} onFailed={() => onFailed(item)} onAssets={onAssets} />;
    return null;
  });
}

export default PlaybackLayers;

// Used by: components/screens/DevicePlayback.jsx.
