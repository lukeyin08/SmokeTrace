"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Use inside Client Components.
 *
 * Note: the client is intentionally untyped (rows come back as `any`). Query
 * results are narrowed to the domain types in `@/lib/types` at the call site,
 * and all writes are validated with Zod before they reach the database.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
