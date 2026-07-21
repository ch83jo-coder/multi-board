"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

async function requireAdmin() {
  if (!hasSupabaseEnv()) return false;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();
  return data?.role === "admin";
}

export async function saveBoard(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: "管理者権限が必要です。" };
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "forum").trim();
  const sort_order = Number(formData.get("sortOrder") ?? 0);
  if (!name || !/^[a-z0-9-]+$/.test(slug) || !Number.isFinite(sort_order))
    return { error: "名前と英小文字のスラッグを確認してください。" };
  const admin = createAdminClient();
  const payload = {
    name,
    slug,
    description,
    icon,
    sort_order,
  };
  const result = id
    ? await admin.from("boards").update(payload).eq("id", id)
    : await admin.from("boards").insert({ ...payload, is_active: true });
  if (result.error) return { error: "ボードを保存できませんでした。" };
  revalidatePath("/");
  revalidatePath("/admin/boards");
  return { success: "ボードを保存しました。" };
}

export async function toggleBoard(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("管理者権限が必要です。");
  const admin = createAdminClient();
  const { error } = await admin
    .from("boards")
    .update({ is_active: formData.get("active") !== "true" })
    .eq("id", String(formData.get("id")));
  if (error) {
    console.error(
      `[boards:toggle] Supabase update failed (${error.code}): ${error.message}`,
    );
    throw new Error("ボードの状態を変更できませんでした。");
  }
  revalidatePath("/admin/boards");
  revalidatePath("/");
}
