// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

type SupabaseTokenGetter = () => Promise<string | null>;

/**
 * The browser never reads application data through Supabase; it only listens
 * for change signals. Supabase Realtime still authorizes every subscription
 * with RLS, so the socket must carry the signed-in user's Clerk JWT instead of
 * falling back to the public anon key. `SupabaseAuthSync` installs the token
 * getter once Clerk is loaded.
 */
let tokenGetter: SupabaseTokenGetter | null = null;
let authReady = false;
const readyWaiters: Array<() => void> = [];
// Serialize auth pushes so a late response from a previous account can never
// overwrite the current token, and so `whenSupabaseAuthReady` waits for it.
let authSync: Promise<void> = Promise.resolve();

function releaseAuthReady() {
  if (authReady) return;
  authReady = true;
  for (const resolve of readyWaiters.splice(0)) resolve();
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    // Called by Supabase Realtime on connect and on every auth refresh. A null
    // result means "not signed in", which keeps the anon key behaviour for
    // public tables only.
    accessToken: async () => {
      if (!tokenGetter) return null;
      try {
        return await tokenGetter();
      } catch {
        return null;
      }
    },
  }
);

/**
 * Registers the Clerk token getter, pushes the token to the Realtime socket,
 * and releases any subscription waiting for authentication. Passing `null`
 * (signed out) still releases the gate so callers never block forever.
 */
export function setSupabaseTokenGetter(getter: SupabaseTokenGetter | null) {
  tokenGetter = getter;

  authSync = authSync
    .catch(() => {})
    .then(() => supabase.realtime.setAuth())
    .catch(() => {})
    .finally(releaseAuthReady);

  return authSync;
}

/**
 * Resolves once the current token has been applied (or cleared). Realtime buses
 * await this before subscribing so the first join already carries the user's
 * JWT and RLS can scope the events.
 */
export function whenSupabaseAuthReady(): Promise<void> {
  if (authReady) return Promise.resolve();
  return new Promise<void>((resolve) => {
    readyWaiters.push(resolve);
  });
}
