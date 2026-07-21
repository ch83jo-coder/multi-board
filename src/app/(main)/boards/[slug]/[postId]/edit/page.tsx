import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/forms/post-form";
import { Card } from "@/components/ui/card";
import { getBoard, getPost, getViewer } from "@/lib/data";

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;
  const [board, post, viewer] = await Promise.all([
    getBoard(slug),
    getPost(postId),
    getViewer(),
  ]);
  if (!board || !post || post.board?.slug !== slug) notFound();
  const isGuestPost = post.author_id === null;
  if (!isGuestPost) {
    if (!viewer) redirect(`/login?next=/boards/${slug}/${postId}/edit`);
    if (viewer.id !== post.author_id && viewer.role !== "admin")
      redirect(`/boards/${slug}/${postId}`);
  }
  const usesGuestPassword = isGuestPost && viewer?.role !== "admin";
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
        投稿を編集
      </h1>
      <Card className="p-5 md:p-7">
        <PostForm board={board} post={post} isGuest={usesGuestPassword} />
      </Card>
    </div>
  );
}
