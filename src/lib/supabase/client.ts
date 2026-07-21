"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) {
    const { url, anonKey } = getPublicEnv();
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
