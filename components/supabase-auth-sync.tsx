"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef } from "react";

import { setSupabaseTokenGetter } from "@/lib/supabaseClient";

/**
 * Bridges Clerk sessions into Supabase Realtime.
 *
 * Realtime RLS authorizes `postgres_changes` subscriptions with the JWT on the
 * socket. Without this component every browser subscribed with the public anon
 * key, so any client could receive rows it was never allowed to see.
 *
 * Supabase expects a `role: "authenticated"` claim and Clerk's native Supabase
 * integration adds it automatically. If the deprecated `supabase` JWT template
 * is configured instead, it is used first; otherwise we fall back to the plain
 * session token so both setups work.
 */
export function SupabaseAuthSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const getSupabaseToken = useCallback(async () => {
    const token = getTokenRef.current;

    try {
      const templated = await token({ template: "supabase" });
      if (templated) return templated;
    } catch {
      // Template not configured; fall through to the native session token.
    }

    return token();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      void setSupabaseTokenGetter(null);
      return;
    }

    // Applies the token and releases subscriptions waiting on auth.
    void setSupabaseTokenGetter(getSupabaseToken);
  }, [isLoaded, isSignedIn, getSupabaseToken]);

  return null;
}
