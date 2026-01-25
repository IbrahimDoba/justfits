/**
 * Image blur placeholder utilities
 * Generates blur data URLs for progressive image loading
 * Similar to Temu's approach for smooth image loading experience
 */

/**
 * Shimmer effect blur placeholder (light gray gradient)
 * Creates a subtle shimmer animation for better perceived performance
 */
export const SHIMMER_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNmNmY3ZjgiIG9mZnNldD0iMCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNlZGVlZjEiIG9mZnNldD0iMjAlIiAvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmN2Y4IiBvZmZzZXQ9IjQwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI2Y2ZjdmOCIgb2Zmc2V0PSIxMDAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9InVybCgjZykiIC8+Cjwvc3ZnPg==';

/**
 * Simple gray blur placeholder
 * Lightweight and fast for quick loading
 */
export const GRAY_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==';

/**
 * Light beige blur (for product images on white backgrounds)
 */
export const PRODUCT_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVR42mP8/5+hnoEIwDiqkL4KAWzZEjsqSMEAAAAASUVORK5CYII=';

/**
 * Get the appropriate blur placeholder based on image source
 * @param imageSrc - The image source URL
 * @returns Base64 encoded blur data URL
 */
export function getImageBlurDataURL(imageSrc?: string | null): string {
  if (!imageSrc) return SHIMMER_BLUR_DATA_URL;

  // Use shimmer effect for all images for consistent experience
  return SHIMMER_BLUR_DATA_URL;
}

/**
 * Priority loading strategy
 * Determines if image should be loaded with priority based on position
 * @param index - Image index in list
 * @param isAboveFold - Whether image is above the fold
 * @returns boolean indicating if image should load with priority
 */
export function shouldPrioritizeImage(
  index: number,
  isAboveFold: boolean = false
): boolean {
  // Prioritize images above the fold or first 2 in list
  return isAboveFold || index < 2;
}

/**
 * Generate responsive image sizes string
 * Optimizes image loading based on viewport
 */
export function getProductImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}

/**
 * Generate responsive carousel image sizes
 */
export function getCarouselImageSizes(): string {
  return '(max-width: 640px) 280px, (max-width: 1024px) 320px, 400px';
}
