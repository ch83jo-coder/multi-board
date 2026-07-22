export const SITE_NAME = "Panmoa";
export const SITE_DESCRIPTION =
  "活発で快適な交流のためのマルチボードコミュニティ。";
export const SITE_ORIGIN = "https://panmoa.com";
export const SITE_REDIRECT_HOSTS = [
  "www.panmoa.com",
  "multi-board-eight.vercel.app",
  "multi-board-git-main-solo-engine.vercel.app",
] as const;

export function isSiteRedirectHost(hostname: string) {
  return SITE_REDIRECT_HOSTS.some((host) => host === hostname.toLowerCase());
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_ORIGIN;
  const normalizedUrl = /^https?:\/\//.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;

  try {
    const url = new URL(normalizedUrl);
    if (isSiteRedirectHost(url.hostname)) return new URL(SITE_ORIGIN);
    return new URL(url.origin);
  } catch {
    return new URL(SITE_ORIGIN);
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
