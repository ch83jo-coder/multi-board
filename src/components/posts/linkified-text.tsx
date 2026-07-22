const URL_PATTERN = /https?:\/\/[^\s<>"']+/giu;
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:)\]}。、！？；：）」』】〉》]+$/u;

type LinkifiedTextProps = {
  children: string;
};

export function LinkifiedText({ children }: LinkifiedTextProps) {
  const parts: Array<
    | { key: string; kind: "link"; value: string }
    | { key: string; kind: "text"; value: string }
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
    parts.push({ key: `link-${index}`, kind: "link", value: url });
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
        part.kind === "link" ? (
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
