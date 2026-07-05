export function normalizeWhiteSpaces(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}
