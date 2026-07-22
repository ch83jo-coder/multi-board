import "server-only";

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  return key;
}

export function getOpenAiKey() {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

export function hasOpenAiKey() {
  return Boolean(getOpenAiKey());
}
