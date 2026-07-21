import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

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
          className={buttonStyles({
            size: "lg",
            className: "mt-6",
          })}
        >
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
