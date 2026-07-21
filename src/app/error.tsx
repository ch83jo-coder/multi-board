"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error-boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <MaterialIcon name="error" className="text-5xl text-error" />
        <h1 className="mt-4 font-headline-lg text-headline-lg-mobile">
          エラーが発生しました
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          処理を完了できませんでした。時間をおいてもう一度お試しください。
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          もう一度試す
        </Button>
      </div>
    </main>
  );
}
