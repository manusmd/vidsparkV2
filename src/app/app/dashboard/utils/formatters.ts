/**
 * Formats a number to a more readable format with K or M suffixes
 * @param num The number to format
 * @returns The formatted number as a string
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}