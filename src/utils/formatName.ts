export default function formatName(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}