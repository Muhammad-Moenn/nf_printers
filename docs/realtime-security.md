# Realtime security (Supabase + Clerk)

The browser only uses Supabase Realtime to know *when* data changed. It never
reads application data through Supabase (all reads go through authorized server
actions). Supabase still authorizes every `postgres_changes` subscription with
Row Level Security (RLS), so the socket must carry the signed-in user's identity.

## What changed in the code

- `lib/supabaseClient.ts` creates the Supabase client with an `accessToken`
  callback. Realtime calls it on connect and on token refresh, and the token is
  pushed immediately when Clerk finishes loading.
- `components/supabase-auth-sync.tsx` installs that callback from Clerk and is
  mounted inside `ClerkProvider` in `app/layout.tsx`. It prefers the `supabase`
  JWT template when present and falls back to the native session token.
- `lib/realtime-bus.ts` waits for auth to be resolved (max 5s) before joining,
  so the first subscription is authenticated instead of using the anon key.
- `prisma/migrations/20261109120000_realtime_rls/migration.sql` enables RLS,
  adds owner/admin policies for the published tables, grants only `SELECT` on
  those tables to `authenticated` (and `Service` to `anon`), and removes the
  legacy permissive `Message` policy.

## Required external configuration

1. **Clerk token must contain `role: "authenticated"` and `sub`(Clerk user id)**
   - Preferred: enable Clerk's native "Connect with Supabase" integration,
     which adds the `role` claim to every session token.
   - Deprecated alternative: create a Clerk JWT template named exactly
     `supabase` and include `"role": "authenticated"` in its claims.
   - Our code tries the `supabase` template first, then plain `getToken()`.

2. **Supabase third-party auth**
   - Supabase dashboard → Authentication → Third Party Auth → add Clerk with
     your Clerk issuer/JWKS URL.

3. **Apply the RLS migration** after steps 1–2:

   ```bash
   npx prisma migrate deploy
   ```

   If the JWT template/trust is not configured first, Realtime joins as `anon`,
   RLS returns no rows, and live updates degrade to empty/unauthorized payloads.

## Database state this migration assumes

- Prisma connects as the table owner (the Supabase pooler `postgres` role), so
  enabling RLS without `FORCE` does **not** affect server queries, actions, or
  webhooks.
- Before this migration `anon`/`authenticated` had no `USAGE` on `public` and no
  table grants, so PostgREST was closed. This migration grants schema usage and
  `SELECT` only on the published tables; `INSERT`/`UPDATE`/`DELETE` remain
  ungranted.
- `Message` previously had a permissive `Enable read access for all users`
  policy; it is dropped so it cannot OR with the owner-only policy.

## What is enforced

- Customer: own `User` row, own `Order`s, the `Payment` of those orders, own
  `Designs`, and `Conversation`/`Message` they participate in.
- `ADMIN`: every row above, plus `Expense` and the `Service` catalog.
- `Service`: public read for `anon` and `authenticated`.
- Most Realtime events are only a signal and invalidate TanStack queries. The
  admin inbox applies the RLS-authorized `new`/`old` rows to its client cache
  (`lib/query/admin-message-cache.ts`); payloads are never used as a server read
  path, so they cannot bypass server authorization even if a policy is wrong.

## Verification checklist

- Sign in as a customer: `Order`/`Message`/`Designs` events for other users must
  not include row data.
- Sign in as an admin: `Order`, `User`, `Payment`, `Expense` events must arrive.
- Sign out: the socket must not receive row data.
- The browser network tab must never contain the Supabase service-role key.

## Notes

- Realtime never invalidates Redis. The trusted server writer invalidates the
  server cache; Realtime only refreshes the client query.
- If you later change roles, update the policies in the same migration flow.
