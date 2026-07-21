export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-white">
      <div className="mx-auto flex max-w-container-max-width flex-col gap-2 px-6 py-8 text-body-sm text-text-muted sm:flex-row sm:justify-between">
        <p>© 2026 Panmoaコミュニティ</p>
        <div className="flex items-center gap-3">
          <p>わかりやすい会話から、強いコミュニティへ。</p>
          <a
            href="https://x.com/soloEnginerbmb"
            target="_blank"
            rel="noopener noreferrer"
            title="開発者のX"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-on-surface transition-colors hover:border-on-surface hover:bg-on-surface hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-3.5 fill-current"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="sr-only">
              開発者 @soloEnginerbmb のXプロフィール
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
