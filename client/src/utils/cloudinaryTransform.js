// Inserts a Cloudinary transformation into a delivery URL to request a
// resized, auto-compressed version instead of the original file — a grid
// thumbnail has no business loading a multi-MB original camera photo.
// Safe no-op for any URL that isn't a Cloudinary "/upload/" URL.
export function getOptimizedThumbnail(url, width = 400) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}
