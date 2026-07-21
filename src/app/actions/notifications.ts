"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function markNotificationsRead(): Promise<ActionState> {
  if (!hasSupabaseEnv()) return { success: "通知を既読にしました。" };

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user)
    return { error: "通知を更新するにはログインしてください。" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", data.user.id)
    .eq("is_read", false);

  if (error) {
    console.error(
      `[notifications:mark-read] Supabase update failed (${error.code}): ${error.message}`,
    );
    return { error: "通知を既読にできませんでした。もう一度お試しください。" };
  }

  return { success: "通知を既読にしました。" };
}
