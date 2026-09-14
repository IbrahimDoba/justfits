// Rewrite a Cloudinary delivery URL to request a small, optimized thumbnail
// (auto format + quality, cropped to a square) instead of the full-res image.
// Non-Cloudinary URLs (or data: URIs) are returned unchanged.
export function cloudinaryThumb(
  url: string | null | undefined,
  size = 96
): string | null {
  if (!url) return null;
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1 || url.startsWith("data:")) return url;
  const rest = url.slice(i + marker.length);
  // Don't double-apply if a transform is already present right after /upload/.
  if (/^[a-z]_/.test(rest)) return url;
  const transform = `f_auto,q_auto,c_fill,w_${size},h_${size}`;
  return `${url.slice(0, i + marker.length)}${transform}/${rest}`;
}
