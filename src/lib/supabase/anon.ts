import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

let anonymousClient: ReturnType<typeof createClient> | null = null;

export function getAnonymousClient() {
  if (!anonymousClient) {
    const { url, anonKey } = getPublicEnv();
    anonymousClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }
  return anonymousClient;
}
