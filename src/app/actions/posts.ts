"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { validateImageFile } from "@/lib/image-upload.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

async function getActor() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return { user: data.user, role: profile?.role ?? "member" };
}

function getGuestCredentials(formData: FormData) {
  const guestName =
    String(formData.get("guestName") ?? "").trim() || "名無しさん";
  const guestPassword = String(formData.get("guestPassword") ?? "");
  if (guestName.length > 30)
    return { error: "お名前は30文字以内で入力してください。" } as const;
  if (guestPassword.length < 4 || guestPassword.length > 128)
    return { error: "パスワードは4〜128文字で入力してください。" } as const;
  return { guestName, guestPassword };
}

const demoMutationError = {
  error: "Supabaseの接続設定後に投稿・コメント機能を利用できます。",
};

export async function savePost(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const boardId = String(formData.get("boardId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const guestMode = formData.get("guestMode") === "true";
  const image = formData.get("image");
  if (title.length < 3 || content.length < 10)
    return {
      error: "タイトルは3文字以上、本文は10文字以上で入力してください。",
    };
  if (!hasSupabaseEnv()) return demoMutationError;

  const supabase = await createClient();
  if (guestMode) {
    const credentials = getGuestCredentials(formData);
    if ("error" in credentials) return credentials;

    if (postId) {
      const { data, error } = await supabase.rpc("update_guest_post", {
        target_post_id: postId,
        guest_password: credentials.guestPassword,
        post_title: title,
        post_content: content,
      });
      if (error) {
        console.error(
          `[posts:guest-update] RPC failed (${error.code}): ${error.message}`,
        );
        return {
          error: "投稿を更新できませんでした。もう一度お試しください。",
        };
      }
      if (!data) return { error: "パスワードが正しくありません。" };
      updateTag("home-sidebar");
      revalidatePath(`/boards/${slug}/${postId}`);
      redirect(`/boards/${slug}/${postId}`);
    }

    const { data, error } = await supabase.rpc("create_guest_post", {
      target_board_id: boardId,
      post_title: title,
      post_content: content,
      author_name: credentials.guestName,
      guest_password: credentials.guestPassword,
    });
    if (error || !data) {
      console.error(
        `[posts:guest-create] RPC failed (${error?.code ?? "no-data"}): ${error?.message ?? "No post id returned"}`,
      );
      return { error: "投稿を保存できませんでした。もう一度お試しください。" };
    }
    updateTag("home-sidebar");
    revalidatePath(`/boards/${slug}`);
    redirect(`/boards/${slug}/${data}`);
  }

  const actor = await getActor();
  if (!actor) return { error: "投稿するにはログインしてください。" };
  const { user, role } = actor;
  let thumbnailUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    const imageError = validateImageFile(image);
    if (imageError) return { error: imageError };
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
    let query = supabase
      .from("posts")
      .update({
        title,
        content,
        ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
      })
      .eq("id", postId);
    if (role !== "admin") query = query.eq("author_id", user.id);
    const { data, error } = await query.select("id").maybeSingle();
    if (error || !data) return { error: "投稿を更新できませんでした。" };
    updateTag("home-sidebar");
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
  updateTag("home-sidebar");
  revalidatePath(`/boards/${slug}`);
  redirect(`/boards/${slug}/${data.id}`);
}

export async function deletePost(formData: FormData) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const supabase = await createClient();
  let query = supabase.from("posts").delete().eq("id", postId);
  if (actor.role !== "admin") query = query.eq("author_id", actor.user.id);
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) {
    console.error(
      `[posts:delete] Failed to delete post (${error?.code ?? "not-found"}): ${error?.message ?? postId}`,
    );
    throw new Error("投稿を削除できませんでした。");
  }
  updateTag("home-sidebar");
  revalidatePath(`/boards/${slug}`);
  redirect(`/boards/${slug}`);
}

export async function addComment(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const content = String(formData.get("content") ?? "").trim();
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const parentId = String(formData.get("parentId") ?? "") || null;
  const guestMode = formData.get("guestMode") === "true";
  if (content.length < 2)
    return { error: "コメントは2文字以上で入力してください。" };
  if (!hasSupabaseEnv()) return demoMutationError;

  const supabase = await createClient();
  if (guestMode) {
    const credentials = getGuestCredentials(formData);
    if ("error" in credentials) return credentials;
    const { error } = await supabase.rpc("create_guest_comment", {
      target_post_id: postId,
      target_parent_id: parentId,
      comment_content: content,
      author_name: credentials.guestName,
      guest_password: credentials.guestPassword,
    });
    if (error) {
      console.error(
        `[comments:guest-create] RPC failed (${error.code}): ${error.message}`,
      );
      return {
        error: parentId
          ? "返信を保存できませんでした。返信先をご確認ください。"
          : "コメントを保存できませんでした。もう一度お試しください。",
      };
    }
    revalidatePath(`/boards/${slug}/${postId}`);
    return {
      success: parentId ? "返信を投稿しました。" : "コメントを投稿しました。",
    };
  }

  const actor = await getActor();
  if (!actor) return { error: "コメントするにはログインしてください。" };
  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("comments")
      .select("post_id,parent_id")
      .eq("id", parentId)
      .maybeSingle();
    if (parentError || parent?.post_id !== postId || parent.parent_id)
      return { error: "返信先のコメントを確認できませんでした。" };
  }
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: actor.user.id,
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
): Promise<ActionState & { vote?: 1 | -1 | null }> {
  const actor = await getActor();
  if (!actor) return { error: "投票するにはログインしてください。" };
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", actor.user.id)
    .maybeSingle();
  if (readError) return { error: "投票状態を確認できませんでした。" };

  if (existing?.value === value) {
    const { error } = await supabase
      .from("post_votes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", actor.user.id);
    if (error) return { error: "投票を取り消せませんでした。" };
    revalidatePath(`/boards/${slug}/${postId}`);
    return { success: "投票を取り消しました。", vote: null };
  }

  // upsert(ON CONFLICT DO UPDATE)は SET 対象の全カラムに UPDATE 権限を要求するが、
  // authenticated には value カラムのみ許可されているため insert/update を分岐する。
  const { error } = existing
    ? await supabase
        .from("post_votes")
        .update({ value })
        .eq("post_id", postId)
        .eq("user_id", actor.user.id)
    : await supabase
        .from("post_votes")
        .insert({ post_id: postId, user_id: actor.user.id, value });
  if (error) {
    console.error(
      `[posts:vote] Failed to apply vote (${error.code}): ${error.message}`,
    );
    return { error: "投票を反映できませんでした。" };
  }
  revalidatePath(`/boards/${slug}/${postId}`);
  return { success: "投票を反映しました。", vote: value };
}

export async function deleteComment(formData: FormData) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const commentId = String(formData.get("commentId") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const supabase = await createClient();
  let query = supabase.from("comments").delete().eq("id", commentId);
  if (actor.role !== "admin") query = query.eq("author_id", actor.user.id);
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) {
    console.error(
      `[comments:delete] Failed to delete comment (${error?.code ?? "not-found"}): ${error?.message ?? commentId}`,
    );
    throw new Error("コメントを削除できませんでした。");
  }
  revalidatePath(`/boards/${slug}/${postId}`);
}

export async function deleteGuestPost(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseEnv()) return demoMutationError;
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const credentials = getGuestCredentials(formData);
  if ("error" in credentials) return credentials;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_guest_post", {
    target_post_id: postId,
    guest_password: credentials.guestPassword,
  });
  if (error) {
    console.error(
      `[posts:guest-delete] RPC failed (${error.code}): ${error.message}`,
    );
    return { error: "投稿を削除できませんでした。もう一度お試しください。" };
  }
  if (!data) return { error: "パスワードが正しくありません。" };
  updateTag("home-sidebar");
  revalidatePath(`/boards/${slug}`);
  redirect(`/boards/${slug}`);
}

export async function deleteGuestComment(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseEnv()) return demoMutationError;
  const commentId = String(formData.get("commentId") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const credentials = getGuestCredentials(formData);
  if ("error" in credentials) return credentials;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_guest_comment", {
    target_comment_id: commentId,
    guest_password: credentials.guestPassword,
  });
  if (error) {
    console.error(
      `[comments:guest-delete] RPC failed (${error.code}): ${error.message}`,
    );
    return {
      error: "コメントを削除できませんでした。もう一度お試しください。",
    };
  }
  if (!data) return { error: "パスワードが正しくありません。" };
  revalidatePath(`/boards/${slug}/${postId}`);
  return { success: "コメントを削除しました。" };
}

async function togglePostFlag(
  formData: FormData,
  flag: "is_pinned" | "is_notice",
) {
  const actor = await getActor();
  if (actor?.role !== "admin") throw new Error("管理者権限が必要です。");
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const active = formData.get("active") === "true";
  const admin = createAdminClient();
  const { error } = await admin
    .from("posts")
    .update({ [flag]: !active })
    .eq("id", postId);
  if (error) {
    console.error(
      `[posts:${flag}] Supabase update failed (${error.code}): ${error.message}`,
    );
    throw new Error("投稿の管理設定を変更できませんでした。");
  }
  revalidatePath(`/boards/${slug}`);
  revalidatePath(`/boards/${slug}/${postId}`);
}

export async function togglePin(formData: FormData) {
  await togglePostFlag(formData, "is_pinned");
}

export async function toggleNotice(formData: FormData) {
  await togglePostFlag(formData, "is_notice");
}
