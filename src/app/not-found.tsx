import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
      <div className="text-center">
        <p className="font-label-md text-primary">404</p>
        <h1 className="mt-2 font-headline-lg text-headline-lg">
          ページが見つかりません
        </h1>
        <p className="mt-3 text-body-md text-text-muted">
          削除されたか、URLが変更された可能性があります。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded bg-primary px-5 py-2.5 font-label-md text-white"
        >
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
