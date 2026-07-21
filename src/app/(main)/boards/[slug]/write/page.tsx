import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/forms/post-form";
import { Card } from "@/components/ui/card";
import { getBoard, getViewer } from "@/lib/data";

export const metadata: Metadata = {
  title: "新規投稿を作成",
  robots: { index: false, follow: false },
};

export default async function WritePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [board, viewer] = await Promise.all([getBoard(slug), getViewer()]);
  if (!board) redirect("/");
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <span className="font-label-sm uppercase tracking-wider text-primary">
          {board.name}掲示板
        </span>
        <h1 className="mt-1 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
          新規投稿を作成
        </h1>
      </div>
      <Card className="p-5 md:p-7">
        <PostForm board={board} isGuest={!viewer} />
      </Card>
    </div>
  );
}
