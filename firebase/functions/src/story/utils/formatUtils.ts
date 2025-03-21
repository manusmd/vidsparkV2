export function formatDescription(
  description: string,
  hashtagsLine: string,
): string {
  const descriptionParts = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const descriptionText = descriptionParts[0];
  return `${descriptionText}\n\n${hashtagsLine}`;
}
