# Caching Architecture

NF Printers uses a three-layer data architecture. Each layer owns one
responsibility and must not duplicate another layer's job.

| Layer | Owns | Lives in |
| --- | --- | --- |
| Upstash Redis | Server-side cache-aside for expensive reads | `lib/redis.ts`, `lib/cache/*` |
| TanStack Query | Client cache for server state | `lib/query/*` |
| Zustand | UI and temporary client state only | `app/store/*` |
| Supabase Realtime | Change notifications | `lib/realtime-bus.ts` |
| Prisma / PostgreSQL | Source of truth | `lib/prisma.ts`, `lib/data`, `app/actions` |

## Server-side cache (Redis)

All caching goes through the shared helpers — never create another client.

- `getOrSet(key, ttl, loader)` — cache-aside with in-process request
  coalescing, a Redis lock against stampedes, TTL jitter, and graceful
  fallback to `loader()` when Redis is unavailable.
- `cacheGet`, `cacheSet`, `cacheDelete`, `cacheIncr` — primitives.
- Loader results are JSON-normalized, so cache hits and misses return the same
  shape (dates become ISO strings). Never cache errors.
- Keys live in `lib/cache/keys.ts`. Prefix `nf:v2`. `lib/cache/keys.ts` and
  `lib/cache/store.ts` are `server-only`.

### Keys and TTLs

| Key | TTL |
| --- | --- |
| `nf:v2:services:public` | 600 s |
| `nf:v2:admin:stats` | 45 s |
| `nf:v2:admin:orders:overview` | 45 s |
| `nf:v2:admin:revenue:analytics` | 45 s |
| `nf:v2:admin:revenue:{period}` | 45 s |
| `nf:v2:admin:dashboard:monthly-revenue:{year}` | 60 s |
| `nf:v2:admin:orders:status-month:{year}` | 60 s |
| `nf:v2:admin:orders:status-year` | 60 s |
| `nf:v2:admin:orders:top-services:{limit}` | 60 s |
| `nf:v2:admin:orders:average-completed` | 60 s |
| `nf:v2:admin:activity` | 20 s |
| `nf:v2:admin:activity:latest-orders` | 20 s |
| `nf:v2:admin:orders:page:{version}:{hash}` | 20 s |
| `nf:v2:admin:orders:action:{version}:top-6` | 20 s |
| `nf:v2:admin:orders:range-counts:{version}:{boundaries}` | 20 s |
| `nf:v2:admin:users:page:{version}:{hash}` | 30 s |
| `nf:v2:admin:services:list` | 60 s |
| `nf:v2:user:{id}:dashboard` | 20 s |
| `nf:v2:user:{id}:orders:reorder` | 60 s |
| `nf:v2:user:{id}:designs` | 120 s |
| `nf:v2:user:{id}:orders:page:{version}:{hash}` | 20 s |

Filtered/paginated reads are cached under a `sha256` filter hash plus a
per-scope version counter (`admin:orders:version`, `admin:users:version`,
`user:{id}:orders:version`). Mutations `INCR` the counter, which retires every
cached page without `KEYS`, `SCAN`, or wildcard deletes. The admin orders
version also retires the filter-independent action list and today/week/month
count entries. Search text never appears in a key.

### Invalidation

Centralized in `lib/cache/invalidate.ts`:

- `invalidateOrderCaches(userId?)` — all admin order/analytics/activity keys,
  bumps order and user versions, clears the admin services list; when a
  `userId` is given it also clears that customer's dashboard/reorder/designs.
  Called by customer `SaveOrder`/`UpdateOrder`, admin order mutations, and any
  other writer of order data.
- `invalidateServiceCaches()` — public catalog + admin services list. Called by
  admin service mutations.
- `invalidateAdminUserCaches()` — bumps the admin users version and clears the
  dashboard stats (they embed total/role user counts). Called by the verified
  Clerk webhook on user create/update/delete.
- `invalidateAdminRevenueCaches()` — revenue analytics, per-period management,
  and the dashboard stats (they embed revenue totals).

Invalidation failures are logged and swallowed by the cache layer; staleness is
bounded by the TTL. A cache failure never changes a database write.

## Client-side cache (TanStack Query)

- Provider: `lib/query/query-provider.tsx` (mounted once in `app/layout.tsx`).
- Defaults: `staleTime` 30 s, `gcTime` 5 min, `retry` 1, no window-focus
  refetch, stale-query refetch on reconnect (Supabase can miss events while the
  socket is down).
- Keys: `lib/query/query-keys.ts` (`user`, `admin`, `messages`, `orders`,
  `pricing`, `public`). Always use the factory; never hand-build keys.
- Hooks: `lib/query/hooks/*`. Admin hooks live in `use-admin-*.ts` and reuse
  `lib/query/admin-defaults.ts`.
- Defaults in `admin-defaults.ts` must match the server action defaults so the
  RSC-seeded key equals the client hook key. A mismatch causes a duplicate
  mount fetch.
- Server Components seed the cache with `queryClient.setQueryData(...)` and
  wrap the page in `HydrationBoundary` (`dehydrate`). Set `staleTime` >= the
  Redis TTL where the data also has a server TTL.

Rules:

- One owner per resource. Do not copy server data into Zustand.
- Use `placeholderData: keepPreviousData` for paginated/filtered queries.
- Invalidate targeted key roots after mutations. `["admin", id, "orders"]`
  prefix-invalidates every filter/page entry; do not invalidate only the
  currently active filter/page key, or other cached variants silently stay
  stale.
- Admin order DTO dates are ISO strings (`formatAdminOrder`), not `Date`
  instances, so a Redis hit and a cache miss return the same shape.
- Debounce text search (`lib/query/use-debounced-value.ts`) so keystrokes do
  not create one request each.

## Realtime

`lib/realtime-bus.ts` keeps one Supabase channel per named bus with a 200 ms
debounce. Buses are declared in `BUS_TABLES`; unknown table names silently do
nothing, so register new tables there.

| Bus | Tables | Consumer |
| --- | --- | --- |
| `user-dashboard-realtime` | `Order` | customer dashboard |
| `admin-dashboard-realtime` | `Order`, `User` | admin overview |
| `admin-orders-page` | `Order` | admin orders |
| `admin-users-page` | `User`, `Order` | admin users |
| `admin-services-page` | `Service`, `Order` | admin services |
| `admin-revenue-page` | `Order`, `Payment`, `Expense` | admin revenue |
| `admin-inbox-conversations` | `Conversation` | admin inbox |
| `messages-realtime` | `Message` | notification badge, admin inbox |

Each flush delivers the batched Supabase payloads to the listener. Signal-only
consumers (the sync components in `components/admin-realtime-sync.tsx` and
`components/orders-realtime-sync.tsx`) invalidate TanStack queries. The admin
overview instead calls the consolidated `getAdminDashboardData` action once and
writes the stats, activity, and revenue-analytics entries
(`refreshAdminOverviewQueries`), so one event never fans out into three
requests. The admin inbox applies the payload to the affected
conversation/detail entries in `lib/query/admin-message-cache.ts` and only
refetches when a new conversation is not cached yet.

**Realtime never invalidates Redis.** Redis is invalidated by the trusted
server-side writer (server action or verified webhook) that performs the
mutation. Never expose a client-triggered invalidation endpoint and never
import Redis into client code.

## Adding a cached admin read

1. Add a key + TTL to `lib/cache/keys.ts` (or reuse an existing key).
2. Authenticate/authorize first (`requireAdminUser`), then wrap the loader in
   `getOrSet`.
3. Add an invalidation call in `lib/cache/invalidate.ts` and invoke it from
   every writer.
4. Add/extend a query key and hook; match the server action defaults exactly.
5. Hydrate from the RSC page and mount the matching realtime sync component.
6. Verify with `npx tsc --noEmit` and `npm run build`.
