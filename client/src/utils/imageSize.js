// Width x height of an image file, read in the browser without uploading it.
// Resolves null when the browser can't decode it (the server decides then).
// Used by: pages/Content.jsx (the 25 megapixel check).
export function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
