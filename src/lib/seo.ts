export const SITE_NAME = "Panmoa";
export const SITE_DESCRIPTION =
  "活発で快適な交流のためのマルチボードコミュニティ。";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "http://localhost:3000";
  const normalizedUrl = /^https?:\/\//.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;

  try {
    const url = new URL(normalizedUrl);
    return new URL(url.origin);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function toPlainText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/(^|\s)[#>*_~`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createDescription(value: string, maxLength = 160) {
  const plainText = toPlainText(value);
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
