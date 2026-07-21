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
      error: "Supabase 환경 변수를 설정하면 로그인을 사용할 수 있습니다.",
    };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 6)
    return { error: "이메일과 6자 이상의 비밀번호를 입력해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "로그인 정보를 확인해 주세요." };
  redirect("/");
}

export async function signup(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseEnv())
    return {
      error: "Supabase 환경 변수를 설정하면 회원가입을 사용할 수 있습니다.",
    };
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (username.length < 2)
    return { error: "사용자 이름은 2자 이상이어야 합니다." };
  if (!email || password.length < 6)
    return { error: "유효한 이메일과 6자 이상의 비밀번호를 입력해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error)
    return { error: "회원가입을 완료하지 못했습니다. 입력값을 확인해 주세요." };
  return {
    success: "확인 이메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.",
  };
}

export async function logout() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
