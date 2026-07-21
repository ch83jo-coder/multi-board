import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import { getServiceRoleKey } from "@/lib/env.server";

export function createAdminClient() {
  const { url } = getPublicEnv();
  return createClient(url, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}
