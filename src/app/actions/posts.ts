"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

async function getUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function savePost(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getUser();
  if (!user) return { error: "投稿するにはログインしてください。" };
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const boardId = String(formData.get("boardId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const image = formData.get("image");
  if (title.length < 3 || content.length < 10)
    return {
      error: "タイトルは3文字以上、本文は10文字以上で入力してください。",
    };
  const supabase = await createClient();
  let thumbnailUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024)
      return { error: "画像は5MB以下のファイルをアップロードしてください。" };
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type))
      return { error: "JPG、PNG、WebP形式の画像のみアップロードできます。" };
    const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(imagePath, await image.arrayBuffer(), {
        contentType: image.type,
      });
    if (uploadError) return { error: "画像をアップロードできませんでした。" };
    thumbnailUrl = supabase.storage.from("post-images").getPublicUrl(imagePath)
      .data.publicUrl;
  }
  if (postId) {
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
      })
      .eq("id", postId)
      .eq("author_id", user.id);
    if (error) return { error: "投稿を更新できませんでした。" };
    revalidatePath(`/boards/${slug}/${postId}`);
    redirect(`/boards/${slug}/${postId}`);
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({
      board_id: boardId,
      author_id: user.id,
      title,
      content,
      thumbnail_url: thumbnailUrl,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "投稿を保存できませんでした。" };
  revalidatePath(`/boards/${slug}`);
  redirect(`/boards/${slug}/${data.id}`);
}

export async function deletePost(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/login");
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const supabase = await createClient();
  await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id);
  revalidatePath(`/boards/${slug}`);
  redirect(`/boards/${slug}`);
}

export async function addComment(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getUser();
  if (!user) return { error: "コメントするにはログインしてください。" };
  const content = String(formData.get("content") ?? "").trim();
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const parentId = String(formData.get("parentId") ?? "") || null;
  if (content.length < 2)
    return { error: "コメントは2文字以上で入力してください。" };
  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    parent_id: parentId,
    content,
  });
  if (error) return { error: "コメントを保存できませんでした。" };
  revalidatePath(`/boards/${slug}/${postId}`);
  return { success: "コメントを投稿しました。" };
}

export async function votePost(
  postId: string,
  slug: string,
  value: 1 | -1,
): Promise<ActionState> {
  const user = await getUser();
  if (!user) return { error: "投票するにはログインしてください。" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("post_votes")
    .upsert({ post_id: postId, user_id: user.id, value });
  if (error) return { error: "投票を反映できませんでした。" };
  revalidatePath(`/boards/${slug}/${postId}`);
  return { success: "投票を反映しました。" };
}
