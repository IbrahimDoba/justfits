/**
 * Utility function for merging Tailwind CSS classes
 * Handles conditional classes and removes duplicates
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[]

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(' ')
}
