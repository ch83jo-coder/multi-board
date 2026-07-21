"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function login(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseEnv())
    return {
      error: "Supabaseの環境変数を設定するとログインを利用できます。",
    };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "");
  if (!email || password.length < 6)
    return {
      error: "メールアドレスと6文字以上のパスワードを入力してください。",
    };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "ログイン情報を確認してください。" };
  redirect(getSafeNextPath(requestedNext));
}

function getSafeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const parsed = new URL(value, "http://panmoa.local");
    return parsed.origin === "http://panmoa.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : "/";
  } catch {
    return "/";
  }
}

export async function signup(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseEnv())
    return {
      error: "Supabaseの環境変数を設定すると新規登録を利用できます。",
    };
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (username.length < 2)
    return { error: "ユーザー名は2文字以上で入力してください。" };
  if (!email || password.length < 6)
    return {
      error: "有効なメールアドレスと6文字以上のパスワードを入力してください。",
    };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error)
    return { error: "新規登録に失敗しました。入力内容を確認してください。" };
  return {
    success: "確認メールを送信しました。認証後にログインしてください。",
  };
}

export async function logout() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
