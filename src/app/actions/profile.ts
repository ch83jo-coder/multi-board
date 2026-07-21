"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function updateProfile(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseEnv())
    return { error: "Supabaseを設定するとプロフィールを編集できます。" };
  const username = String(formData.get("username") ?? "").trim();
  if (username.length < 2 || username.length > 32)
    return { error: "ユーザー名は2〜32文字で入力してください。" };

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user)
    return { error: "プロフィールを編集するにはログインしてください。" };
  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", auth.user.id);
  if (error) {
    console.error(
      `[profile:update] Supabase update failed (${error.code}): ${error.message}`,
    );
    return {
      error:
        error.code === "23505"
          ? "そのユーザー名はすでに使用されています。"
          : "プロフィールを更新できませんでした。",
    };
  }
  revalidatePath("/", "layout");
  revalidatePath("/profile");
  return { success: "プロフィールを更新しました。" };
}
