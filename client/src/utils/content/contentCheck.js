// A free first check of what a user is about to upload, done in their own browser with an open-source
// image model (nothing leaves their device). For each picture the model gives a probability for five
// categories. Two numbers are used here: a "strong" one (the model's most serious categories added
// together) and a "mild" one (its milder category). A file is blocked when either is high. It is a
// guess, not a guarantee, and anyone who calls the upload address directly skips it.
//
// The model and TensorFlow are a big download (about 5 MB), so they load only the first time a file
// is checked, as their own file. If they cannot load, or a video cannot be decoded by the browser,
// the file is let through (never blocked by our own failure) and a line goes to the console.

// Block a file when its strong score reaches BLOCK_STRONG_AT, or its mild score reaches BLOCK_MILD_AT
// (both 0 to 1). Raise a number for fewer false alarms, lower it to be stricter. The console shows
// both scores of every file checked, so they can be set from real examples.
export const BLOCK_STRONG_AT = 0.1;
export const BLOCK_MILD_AT = 0.85;
const VIDEO_FRAMES = 12; // frames checked per video, spread over its length
const FRAME_WIDTH = 448; // a frame is drawn this wide before it is checked
const SEEK_TIMEOUT_MS = 8000;

// The model's own output class names, spelled as it reports them (the only place they appear).
const STRONG_CLASSES = ["Porn", "Hentai"];
const MILD_CLASS = "Sexy";

let modelPromise = null;
function loadModel() {
  if (!modelPromise) {
    // only the small MobileNetV2 model (the package also ships two bigger ones we do not use)
    modelPromise = Promise.all([import("nsfwjs/core"), import("nsfwjs/models/mobilenet_v2")])
      .then(([core, models]) => core.load("MobileNetV2", { modelDefinitions: [models.MobileNetV2Model] }))
      .catch((error) => {
        modelPromise = null; // try again next time
        throw error;
      });
  }
  return modelPromise;
}

// Start downloading the model early (for example when the upload button is pressed), so the first
// check is quick.
export function warmUpContentCheck() {
  loadModel().catch(() => {});
}

// { strong, mild } from one prediction list
function scoresOf(predictions) {
  const p = Object.fromEntries(predictions.map((x) => [x.className, x.probability]));
  return { strong: STRONG_CLASSES.reduce((sum, name) => sum + (p[name] || 0), 0), mild: p[MILD_CLASS] || 0 };
}

const isBlocked = (scores) => scores.strong >= BLOCK_STRONG_AT || scores.mild >= BLOCK_MILD_AT;

const emptyScores = () => ({ strong: 0, mild: 0 });
function keepWorst(worst, frame) {
  worst.strong = Math.max(worst.strong, frame.strong);
  worst.mild = Math.max(worst.mild, frame.mild);
}

function abortError() {
  return new DOMException("Cancelled", "AbortError");
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The picture could not be read"));
    img.src = url;
  });
}

function loadVideo(url) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error("The video could not be read by this browser"));
    video.src = url;
  });
}

function seekTo(video, time) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Seeking took too long")), SEEK_TIMEOUT_MS);
    video.onseeked = () => {
      clearTimeout(timer);
      resolve();
    };
    video.currentTime = time;
  });
}

// An animated GIF / WebP / PNG: a picture element only shows (and so only gets checked on) its first
// frame, so the frames are decoded with the browser's ImageDecoder and up to VIDEO_FRAMES of them are
// checked, spread over the animation. Resolves to the worst scores, or null when the file is not
// animated or this browser has no ImageDecoder (then the first frame is all that is checked).
async function checkAnimated(model, file, signal) {
  if (typeof ImageDecoder === "undefined" || !/^image\/(gif|webp|png|apng)$/.test(file.type)) return null;
  const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type: file.type });
  try {
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;
    if (!track?.animated || track.frameCount < 2) return null;

    const count = Math.min(VIDEO_FRAMES, track.frameCount);
    const worst = emptyScores();
    for (let i = 0; i < count; i += 1) {
      if (signal?.aborted) throw abortError();
      const index = Math.floor((track.frameCount * i) / count); // the first frame, then evenly spread
      const { image } = await decoder.decode({ frameIndex: index });
      const canvas = document.createElement("canvas");
      const width = Math.min(FRAME_WIDTH, image.displayWidth);
      canvas.width = width;
      canvas.height = Math.round(width * (image.displayHeight / image.displayWidth));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      keepWorst(worst, scoresOf(await model.classify(canvas)));
      if (isBlocked(worst)) break; // one bad frame is enough
    }
    return worst;
  } finally {
    decoder.close();
  }
}

async function checkImage(model, file, signal) {
  try {
    const animated = await checkAnimated(model, file, signal);
    if (animated) return animated;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.warn("Animated picture: checking the first frame only:", error.message); // then the picture below
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return scoresOf(await model.classify(img));
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function checkVideo(model, file, signal) {
  const url = URL.createObjectURL(file);
  try {
    const video = await loadVideo(url);
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const count = duration > 0 ? VIDEO_FRAMES : 1;
    const canvas = document.createElement("canvas");
    const width = Math.min(FRAME_WIDTH, video.videoWidth || FRAME_WIDTH);
    canvas.width = width;
    canvas.height = Math.round(width * ((video.videoHeight || 9) / (video.videoWidth || 16)));
    const context = canvas.getContext("2d");

    const worst = emptyScores();
    for (let i = 0; i < count; i += 1) {
      if (signal?.aborted) throw abortError();
      // evenly spread, never the very first or last instant (often black)
      if (duration > 0) await seekTo(video, (duration * (i + 0.5)) / count);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      keepWorst(worst, scoresOf(await model.classify(canvas)));
      if (isBlocked(worst)) break; // one bad frame is enough
    }
    return worst;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Checks one image or video file. Resolves to { blocked } (and the scores, for the console).
// Rejects only with an AbortError (the user cancelled); every other failure lets the file through.
//   signal  an AbortSignal: cancelling stops the check between frames
export async function checkFile(file, { signal } = {}) {
  try {
    const model = await loadModel();
    if (signal?.aborted) throw abortError();
    const scores = file.type.startsWith("video/") ? await checkVideo(model, file, signal) : await checkImage(model, file, signal);
    if (signal?.aborted) throw abortError();
    const blocked = isBlocked(scores);
    console.info(
      `Content check: ${file.name}: strong ${scores.strong.toFixed(2)} (blocked from ${BLOCK_STRONG_AT}), mild ${scores.mild.toFixed(2)} (blocked from ${BLOCK_MILD_AT}) -> ${blocked ? "BLOCKED" : "allowed"}`,
    );
    return { blocked, scores };
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.warn("Content check skipped:", error.message);
    return { blocked: false, scores: null, skipped: true };
  }
}

// Used by: pages/Content.jsx (before a file is uploaded).
