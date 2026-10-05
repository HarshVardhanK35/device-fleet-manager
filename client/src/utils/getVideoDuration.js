// Reads a video file's real duration (in ms) by loading it into a hidden
// <video> element and waiting for its metadata — the browser never exposes
// this from the File object itself. Used so video content tiles can show a
// duration badge too, even though (per our business rule) that duration is
// never user-editable, only ever read from the file.
export function getVideoDurationMs(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(video.duration * 1000));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video duration"));
    };

    video.src = url;
  });
}
