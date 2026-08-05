const URL_PATTERN = /https?:\/\/[^\s<>"']+/giu;
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:)\]}。、！？；：）」』】〉》]+$/u;
const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/u;

type LinkifiedTextProps = {
  children: string;
};

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [format, id] = url.pathname.split("/").filter(Boolean);
        if (["embed", "live", "shorts"].includes(format)) videoId = id;
      }
    } else if (
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com")
    ) {
      const [format, id] = url.pathname.split("/").filter(Boolean);
      if (format === "embed") videoId = id;
    }

    return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

function YouTubeEmbed({ url, videoId }: { url: string; videoId: string }) {
  return (
    <figure className="my-5 whitespace-normal">
      <div className="aspect-video overflow-hidden rounded-lg border border-border-subtle bg-black shadow-sm">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube動画プレーヤー"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <figcaption className="mt-2 text-body-sm">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
        >
          YouTubeで見る
        </a>
      </figcaption>
    </figure>
  );
}

export function LinkifiedText({ children }: LinkifiedTextProps) {
  const parts: Array<
    | { key: string; kind: "link"; value: string }
    | { key: string; kind: "text"; value: string }
    | { key: string; kind: "youtube"; value: string; videoId: string }
  > = [];
  let cursor = 0;

  for (const match of children.matchAll(URL_PATTERN)) {
    const index = match.index;
    const rawUrl = match[0];
    if (index > cursor) {
      parts.push({
        key: `text-${cursor}`,
        kind: "text",
        value: children.slice(cursor, index),
      });
    }

    const trailingPunctuation = rawUrl.match(TRAILING_PUNCTUATION_PATTERN)?.[0];
    const url = trailingPunctuation
      ? rawUrl.slice(0, -trailingPunctuation.length)
      : rawUrl;
    const videoId = getYouTubeVideoId(url);
    parts.push(
      videoId
        ? { key: `youtube-${index}`, kind: "youtube", value: url, videoId }
        : { key: `link-${index}`, kind: "link", value: url },
    );
    if (trailingPunctuation) {
      parts.push({
        key: `punctuation-${index}`,
        kind: "text",
        value: trailingPunctuation,
      });
    }
    cursor = index + rawUrl.length;
  }

  if (cursor < children.length) {
    parts.push({
      key: `text-${cursor}`,
      kind: "text",
      value: children.slice(cursor),
    });
  }

  return (
    <div className="whitespace-pre-wrap break-words">
      {parts.map((part) =>
        part.kind === "youtube" ? (
          <YouTubeEmbed
            key={part.key}
            url={part.value}
            videoId={part.videoId}
          />
        ) : part.kind === "link" ? (
          <a
            key={part.key}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            aria-label={`${part.value}（新しいタブで開く）`}
          >
            {part.value}
          </a>
        ) : (
          <span key={part.key}>{part.value}</span>
        ),
      )}
    </div>
  );
}
