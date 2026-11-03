// Inserts a Cloudinary transformation into a delivery URL to request a
// resized, auto-compressed version instead of the original file — a grid
// thumbnail has no business loading a multi-MB original camera photo.
// Safe no-op for any URL that isn't a Cloudinary "/upload/" URL.
export function getOptimizedThumbnail(url, width = 400) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

// A tiny, blurred copy (about 1 kB) of the same picture, for the blur-up
// placeholder in components/ui/BlurImage.jsx. Same no-op for non-Cloudinary URLs.
export function getBlurPlaceholder(url) {
  if (!url || !url.includes("/upload/")) return null;
  return url.replace("/upload/", "/upload/w_24,c_limit,q_30,e_blur:300,f_auto/");
}
