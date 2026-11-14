-- Realtime / PostgREST authorization for dashboard tables.
--
-- Before this migration these tables had RLS disabled, so the public anon key
-- (shipped to every browser) could subscribe to Supabase Realtime and receive
-- full rows for every customer's orders, users, payments, and expenses.
--
-- Prerequisites (configured outside the repository, see
-- `docs/realtime-security.md`):
--   1. A Clerk session token containing `role: "authenticated"` and `sub`
--      equal to the Clerk user id (native Clerk<->Supabase integration or the
--      deprecated `supabase` JWT template).
--   2. Supabase configured to trust that issuer (Clerk third-party auth).
--
-- RLS is enabled WITHOUT FORCE, so Prisma (the table owner / pooler role) keeps
-- full access. Only Realtime and PostgREST clients are restricted.

-- Resolve the caller's Clerk id from the JWT. SECURITY DEFINER keeps the
-- helper independent of schema grants the policy roles may lack.
create or replace function public.nf_current_clerk_user_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

-- Resolve the application user for the current JWT. SECURITY DEFINER avoids
-- recursive RLS evaluation on "User".
create or replace function public.nf_current_app_user_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select u.id
  from public."User" u
  where u."clerkUserId" = public.nf_current_clerk_user_id()
  limit 1
$$;

create or replace function public.nf_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."User" u
    where u."clerkUserId" = public.nf_current_clerk_user_id()
      and u.role = 'ADMIN'
  )
$$;

grant execute on function public.nf_current_clerk_user_id() to authenticated, anon;
grant execute on function public.nf_current_app_user_id() to authenticated, anon;
grant execute on function public.nf_is_admin() to authenticated, anon;

-- The Realtime/PostgREST roles need schema usage and SELECT for RLS to be
-- evaluated. This project had revoked both, so grant only the published
-- tables; RLS still filters every row. INSERT/UPDATE/DELETE stay ungranted.
grant usage on schema public to authenticated, anon;
grant select on "User" to authenticated;
grant select on "Order" to authenticated;
grant select on "Payment" to authenticated;
grant select on "Expense" to authenticated;
grant select on "Designs" to authenticated;
grant select on "Conversation" to authenticated;
grant select on "Message" to authenticated;
grant select on "Service" to anon, authenticated;

-- User: a customer sees their own row; admin see every user.
alter table "User" enable row level security;
drop policy if exists "nf_user_select" on "User";
create policy "nf_user_select" on "User"
  for select to authenticated
  using (
    "clerkUserId" = public.nf_current_clerk_user_id()
    or public.nf_is_admin()
  );

-- Order: a customer sees their own orders; admin see every order.
alter table "Order" enable row level security;
drop policy if exists "nf_order_select" on "Order";
create policy "nf_order_select" on "Order"
  for select to authenticated
  using ("userId" = public.nf_current_app_user_id() or public.nf_is_admin());

-- Payment: the owning customer or admin.
alter table "Payment" enable row level security;
drop policy if exists "nf_payment_select" on "Payment";
create policy "nf_payment_select" on "Payment"
  for select to authenticated
  using (
    exists (
      select 1
      from "Order" o
      where o.id = "Payment"."orderId"
        and (o."userId" = public.nf_current_app_user_id() or public.nf_is_admin())
    )
  );

-- Expense: internal financial data, admin only.
alter table "Expense" enable row level security;
drop policy if exists "nf_expense_select" on "Expense";
create policy "nf_expense_select" on "Expense"
  for select to authenticated
  using (public.nf_is_admin());

-- Designs: the owning customer or admin.
alter table "Designs" enable row level security;
drop policy if exists "nf_designs_select" on "Designs";
create policy "nf_designs_select" on "Designs"
  for select to authenticated
  using ("userId" = public.nf_current_app_user_id() or public.nf_is_admin());

-- Conversation: participants or admin.
alter table "Conversation" enable row level security;
drop policy if exists "nf_conversation_select" on "Conversation";
create policy "nf_conversation_select" on "Conversation"
  for select to authenticated
  using (
    "userId" = public.nf_current_app_user_id()
    or "adminId" = public.nf_current_app_user_id()
    or public.nf_is_admin()
  );

-- Message: messages of conversations the caller participates in, or admin.
-- The legacy permissive policy must go or it would OR with this one.
alter table "Message" enable row level security;
drop policy if exists "Enable read access for all users" on "Message";
drop policy if exists "nf_message_select" on "Message";
create policy "nf_message_select" on "Message"
  for select to authenticated
  using (
    exists (
      select 1
      from "Conversation" c
      where c.id = "Message"."conversationId"
        and (
          c."userId" = public.nf_current_app_user_id()
          or c."adminId" = public.nf_current_app_user_id()
          or public.nf_is_admin()
        )
    )
  );

-- Service: the catalog is public, but RLS is made explicit so it cannot be
-- confused with the private tables above.
alter table "Service" enable row level security;
drop policy if exists "nf_service_select" on "Service";
create policy "nf_service_select" on "Service"
  for select to anon, authenticated
  using (true);
