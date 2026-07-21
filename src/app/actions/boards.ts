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
  if (!(await requireAdmin())) return { error: "관리자 권한이 필요합니다." };
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "forum").trim();
  const sort_order = Number(formData.get("sortOrder") ?? 0);
  if (!name || !/^[a-z0-9-]+$/.test(slug))
    return { error: "이름과 영문 소문자 slug를 확인해 주세요." };
  const admin = createAdminClient();
  const payload = {
    name,
    slug,
    description,
    icon,
    sort_order,
    is_active: true,
  };
  const result = id
    ? await admin.from("boards").update(payload).eq("id", id)
    : await admin.from("boards").insert(payload);
  if (result.error) return { error: "보드를 저장하지 못했습니다." };
  revalidatePath("/");
  revalidatePath("/admin/boards");
  return { success: "보드가 저장되었습니다." };
}

export async function toggleBoard(formData: FormData) {
  if (!(await requireAdmin())) return;
  const admin = createAdminClient();
  await admin
    .from("boards")
    .update({ is_active: formData.get("active") !== "true" })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/boards");
  revalidatePath("/");
}
