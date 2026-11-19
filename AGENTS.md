# AGENTS.md — NF Printers

This file is the permanent instruction set for AI coding agents working in this repository.
It applies to every task unless the user explicitly overrides it.

## Instruction Loading and Session Management

- The latest root `AGENTS.md` is the canonical source of project-wide instructions.
- **Same session:** Read `AGENTS.md` once at the beginning of the session, keep its instructions
  in working context, and apply them to every subsequent prompt. Do not reread the entire file
  for each request.
- **New session:** A new OpenCode tab or a new agent conversation is a fresh session. Read the
  complete, latest root `AGENTS.md` before performing any implementation.
- **Updated instructions:** If `AGENTS.md` is modified, reload the complete updated file before
  the next implementation task. The latest version replaces outdated instructions in context.
- **Context reset:** If the conversation is compacted or reset, or project instructions are no
  longer available in context, reread `AGENTS.md` before continuing.
- **Automatic compliance:** Apply the loaded project instructions to every task without asking
  the user to repeat them.
- **Token efficiency:** Do not repeatedly open or read `AGENTS.md` during an active session when
  its contents are already available. Use a targeted read only when a specific rule is missing
  or the file may have changed.
- **Priority:** Follow the latest root `AGENTS.md` as the project-wide standard. Explicit
  instructions in the current user request may override a project rule when they legitimately
  conflict; ask before proceeding if the conflict is destructive or ambiguous.

## 1. Project Snapshot

NF Printers is a production printing-services platform with customer ordering, design uploads,
payments, messaging, and role-based dashboards.

- **Framework:** Next.js `16.1.1` App Router, React `19.2.3`, React Compiler enabled.
- **Language:** TypeScript strict mode (`npx tsc --noEmit` is the main check).
- **Styling:** Tailwind CSS v4, CSS-variable design tokens, shadcn/ui (`new-york`), Radix UI,
  lucide-react and @tabler/icons-react.
- **Database:** PostgreSQL (Supabase session pooler) through Prisma `5.22`.
- **Auth:** Clerk, with application roles `CUSTOMER`, `EMPLOYEE`, `ADMIN`.
- **Realtime:** Supabase Realtime (`postgres_changes`) through the shared client bus in
  `lib/realtime-bus.ts`.
- **Client state:** Zustand stores in `app/store` for UI state, cart state, and temporary
  client-only application state.
- **Server state:** TanStack Query in `lib/query` for client-side server-state fetching,
  caching, request deduplication, invalidation, and mutations. The customer dashboard is being
  migrated to TanStack Query incrementally and with explicit approval.
- **Server data:** server actions in `app/actions`, API route handlers in `app/api`, and
  data-access functions in `lib/data`.
- **Server-only boundaries:** `import "server-only"` is already used in server modules such as
  `lib/auth.ts` and `lib/data/services.ts`; extend this pattern where it keeps Prisma, secrets,
  and server logic out of client bundles.
- **i18n:** next-intl with locale-prefixed routes, `en` and `ur`.
- **Uploads:** UploadThing. **Email:** Resend.
- **Pricing:** rule-based calculator with optional external model at `PRICING_MODEL_URL`.
- **Animation:** Framer Motion is already installed (`framer-motion` and the `motion` package,
  imported as either `framer-motion` or `motion/react`). Both entry points exist in the codebase;
  follow the nearest file. Do not add another animation library.
- **Active workstream:** the public landing page at `app/[locale]/(main)/page.tsx` is being
  redesigned section by section against a shared reference UI. Read **Section 15** before touching
  any landing-page section.

### Repository Map

| Path | Responsibility |
| --- | --- |
| `app/[locale]/(main)` | Public marketing, services, contact. |
| `app/[locale]/(auth)` | Clerk sign-in, sign-up, forgot-password. |
| `app/[locale]/(dashborad)` | Customer and admin dashboards. The misspelled `(dashborad)` is intentional; preserve it. |
| `app/[locale]/(dashborad)/*/\(withCards\)` | Dashboard pages that render summary cards. |
| `app/[locale]/(dashborad)/*/\(withoutCards\)` | Focused pages without summary cards. |
| `app/actions` | Server actions (`"use server"`), including authorization. |
| `app/api` | Route handlers, webhooks, realtime payloads, uploads. |
| `app/schemas` | Zod schemas shared by actions/UI. |
| `app/store` | Zustand stores for UI/cart state and legacy dashboard shared state that has not been migrated yet. |
| `components` | Feature and layout components; reusable primitives live in `components/ui`. |
| `lib/auth.ts` | Clerk → application-user synchronization and `getCurrentUser`. |
| `lib/data` | Server data-access functions and client-side API wrappers. Never mix server-only and client code in one module. |
| `lib/api` | Shared axios-based `apiClient`, `ApiError`, and endpoint constants. |
| `lib/query` | TanStack Query client, keys, provider, hooks, and hydration/prefetch helpers. |
| `lib/dashboard-data.ts` | Server-side dashboard aggregation helpers. |
| `lib/db-aggregations.ts` | Database-level aggregation helpers. |
| `lib/rate-limit.ts` | Shared rate-limit helper for sensitive endpoints. |
| `lib/pricing` | Pricing schema, rule engine, and model client. |
| `lib/realtime-bus.ts` | Shared Supabase channel/debounce bus. |
| `lib/prisma.ts` | Prisma singleton and pool configuration. |
| `app/api/uploadthing` | UploadThing file router and authorized file delete/download routes. |
| `i18n` | Locale routing, navigation wrappers, request configuration. |
| `messages` | `en.json` and `ur.json` translation catalogs. |
| `prisma` | Schema, migrations, seed. |
| `proxy.ts` | Clerk + next-intl request middleware. |

## 2. Commands

```bash
npm run dev                 # Start the development server
npx tsc --noEmit            # Type-check (required after code changes)
npm run build               # prisma generate + next build (verify when safe)
npm run prisma:generate     # Regenerate Prisma client
npm run prisma:migrate      # Create/apply a migration (approval required)
```

There is no lint script and no automated test script configured in this repository. Do not
invent scripts or add a linter, test runner, or testing dependency without approval.

Operational notes:

- Do not run `npm run build` while the dev server is running.
- `prisma generate` can fail on Windows with `EPERM` when the dev server holds the Prisma
  engine DLL. Stop the dev server before regenerating.
- Report exactly which checks were run. Never claim a check passed unless it was executed.
- Do not modify `tsconfig.json` strictness, Next.js config, or dependency versions to make a
  check pass.

## 3. Engineering Standard

Work as a senior full-stack engineer.

- Write clean, readable, scalable, production-ready code.
- Follow SOLID and separation of concerns where they fit the existing design.
- Prefer the smallest change that fully solves the task.
- Avoid duplicated logic, speculative abstractions, and overengineering.
- Reuse existing utilities, components, schemas, and data functions before creating new ones.
- Follow the conventions of the nearest existing file rather than imposing a new style.
- Keep changes focused and reviewable.

## 4. Before Implementation

Always:

1. Understand the request and restate the concrete outcome.
2. Inspect the relevant pages, components, actions, routes, data functions, schemas, and models.
3. Trace dependencies and data flow in both directions.
4. Identify existing behavior and side effects that must be preserved.
5. Determine authorization, validation, serialization, and realtime implications.
6. Identify rendering, caching, navigation, bundle, and database-query performance implications.
7. Check whether the change requires schema, migration, index, dependency, or infrastructure
   changes. If it does, stop and ask for approval before proceeding.

Never edit a file whose responsibility you do not understand.

## 5. Architecture Rules

### Rendering and client boundaries

- Server Components are the default. Add `"use client"` only for state, effects, browser APIs,
  event handlers, or third-party client libraries.
- Do not turn a server page into a client page to solve a local problem.
- Keep authorization and database access on the server.
- Prisma `Decimal` values cannot cross the server/client boundary. Convert them to numbers
  (or plain serializable values) before passing data to client components.

### Data fetching layers

| Layer | Owns | Must not |
| --- | --- | --- |
| `lib/prisma.ts` | Server-side database access | Be imported by client code |
| `lib/data/*` server functions, `app/actions/*` | Authorized server reads/writes | Be called from client components if server-only |
| `app/api/*` | Validated, authorized HTTP handlers | Bypass Zod, auth, or rate limits |
| `lib/data/*` client wrappers, `lib/api/client.ts` | Client calls to authorized endpoints | Contain Prisma or server secrets |
| `lib/query/*` | TanStack Query keys, hooks, cache, mutations | Import `server-only` modules or Prisma |
| `app/store/*` | UI, cart, temporary client state | Store server data owned by TanStack Query |
| `lib/realtime-bus.ts` | Central realtime events | Be duplicated in per-widget channels |

- Server Components call server functions from `lib/data/*` or server actions. They never call
  client query hooks.
- Client Components call TanStack Query hooks or client wrappers from `lib/data/*`. They never
  call `fetch`, Prisma, or route handlers directly.
- Keep server-only and client modules separate. Add `import "server-only"` to modules that must
  never enter a client bundle.
- Endpoint strings belong in `lib/api/endpoints.ts`, not scattered in components.
- Server actions live in `app/actions/*` with `"use server"`.
- Keep one source of truth per resource. Do not duplicate the same query or fetch in multiple
  components or stores.
- Preserve existing naming unless a rename is part of the task.

### Server and client data boundaries

- **Server Components** render data on the server, may query Prisma through authorized
  `lib/data` functions, and pass only serializable data to Client Components.
- **Client Components** handle interactivity, browser APIs, and TanStack Query. They must not
  receive Prisma `Decimal` values, non-serializable objects, or server-only modules.
- **Server Actions** authenticate, authorize, validate with Zod, mutate, and revalidate. Never
  trust action arguments.
- **API route handlers** validate input, authorize, rate-limit where appropriate, and return
  JSON with safe errors and correct cache headers.
- **Client API functions** call authorized endpoints through `apiClient`; they contain no
  database access and no secrets.
- **TanStack Query hooks** wrap client API functions with query keys, cache policy, and
  mutations. They must not import `server-only` or Prisma modules.
- **Realtime handlers** invalidate queries or update stores; they never bypass server
  authorization.

### Server state: TanStack Query

- TanStack Query owns client-cached server state in migrated modules, starting with the customer
  dashboard. Use `lib/query/query-client.ts`, `lib/query/query-keys.ts`, and
  `lib/query/hooks/*`.
- Hydrate initial server data with `dehydrate`/`HydrationBoundary` or `initialData`, then reuse
  that cache on navigation. Do not refetch immediately after hydration.
- Invalidate targeted query keys after mutations. Use optimistic updates only with a rollback
  path.
- Prevent stale responses from overwriting newer data: pass `AbortSignal` through `queryFn`
  where available, avoid overlapping forced refetches, and do not refetch on every mount.
- Do not duplicate the same server data in both TanStack Query and Zustand. During migration,
  one resource has one owner; remove the legacy copy when a module moves to TanStack Query.
- Do not wrap static or purely server-rendered content in TanStack Query; it does not benefit
  from client caching.
- The approved migration is incremental. Do not migrate unmigrated modules wholesale and do not
  add another query library.

### Client state: Zustand

- Zustand owns UI state, cart state, and temporary client-only state.
- Existing dashboard stores (`user-dashboard-store.ts`, `admin-dashboard-store.ts`) remain valid
  for modules not yet migrated. Preserve them until the module is migrated.
- Stores must never perform database access, server-side authorization, or hold secrets.
- Do not store server data in Zustand when TanStack Query already owns it.
- Clear or reset user-specific store state on sign-out or account switch. Zustand is never an
  authorization boundary.

### RSC and client caching

Distinguish these mechanisms; do not treat them as interchangeable:

- **Next.js App Router navigation** fetches React Server Component payloads as the user
  navigates. Do not disable RSC or convert pages to Client Components to avoid those requests.
- **Server Component data fetching** runs on the server per request (subject to Next.js
  caching). A client TanStack Query cache cannot prevent or replace it.
- **API requests** are client-to-server calls made by TanStack Query or event handlers.
- **TanStack Query cache** caches client-side server state. It does not stop Server Components
  from executing or fetching.
- **React `cache()`** memoizes a function within a single request. It is not a cross-request
  cache and must not be used to bypass authorization.
- **Next.js caching/revalidation** (`revalidatePath`, `revalidateTag`, route segment settings)
  controls server rendering and fetch caching. Define invalidation before enabling caching.
- Eliminate duplicate server-side fetches by reusing `React.cache()` within a request, passing
  data down, or hydrating TanStack Query with server data. Preserve legitimate initial server
  rendering; do not move server-only data to the client just to share it.
- Do not use `router.refresh()` or forced full refreshes as a substitute for correct query
  invalidation.

### Authentication and authorization

- Clerk is the identity provider; the application `User` record is the authorization source.
- Use `getCurrentUser` / `GetDBUser` for the signed-in application user.
- `proxy.ts` performs coarse route/API protection only. It cannot query roles and is never the
  only authorization boundary.
- Every protected server operation re-verifies authentication.
- Every admin action/API must re-check `role === "ADMIN"` on the server; employee/admin access
  follows the application role model and least privilege.
- Every customer-scoped query must filter by the authenticated `userId`.
- Preserve Clerk webhook signature verification in `app/api/webhooks/clerk`.
- Never expose server secrets, tokens, database URLs, or internal error details.

The mandatory IDOR, ownership, privilege-escalation, and role-model requirements are in
**Security Standard → Authentication and authorization**.

### Database

- Use the shared `prisma` client from `lib/prisma.ts`; never instantiate another `PrismaClient`.
- Select only required fields. Avoid loading whole records or relations unnecessarily.
- Avoid N+1 queries: batch lookups, use `include`/`select` deliberately, or aggregate in SQL.
- Paginate list endpoints and admin tables with bounded page sizes. Never introduce an
  unbounded table read.
- Run independent queries in parallel with `Promise.all` when they do not depend on each other.
- Prefer database aggregation/grouping over pulling rows into JavaScript.
- Inspect generated SQL or query behavior when investigating slow queries. Propose missing
  indexes for approval instead of adding them.
- Monitor query duration for slow paths; log context without customer data or secrets.
- Preserve the existing connection pool and pooling configuration.
- Use transactions for multi-step writes that must be atomic; avoid wrapping unrelated reads
  and writes in a transaction.
- Preserve existing date semantics (`orderDate` vs `createdAt`) in reporting logic.
- **Do not change the schema, migrations, indexes, or connection/pooling configuration without
  explicit user approval.**

### Supabase Realtime

- Reuse `lib/realtime-bus.ts` for new dashboard order/user subscriptions. Do not create one
  channel per widget.
- Always remove channels/subscriptions in effect cleanup.
- Prevent duplicate subscriptions, duplicate fetches, and feedback loops.
- Debounce refreshes and keep database changes synchronized with the UI.
- Prefer targeted payload updates/stores over full-page reloads.
- Preserve existing realtime behavior unless the task explicitly changes it.
- Client realtime code must not bypass authorization; the API/action it calls must authorize.
- Require appropriate Supabase RLS policies and never rely on client-side filters for
  authorization. Customers must receive only events they are permitted to see.
- Never expose service-role keys to client code; the browser uses only the anon key.

### Error handling

- API routes return JSON errors with meaningful messages and appropriate status codes
  (`400`, `401`, `403`, `404`, `429`, `500`, `502`) and `Cache-Control: no-store` where
  appropriate.
- Server actions follow the local convention: return `{ success, error }`, return `null` for
  unauthorized reads, or throw for genuinely exceptional failures. Match the surrounding file.
- Never silently swallow an error. Log server-side with enough context, but do not leak stack
  traces or secrets to users.
- Client code surfaces actionable messages and handles loading/empty/error states.
- Use `ApiError` from `lib/api/client.ts` for transport failures. `apiClient` preserves
  caller-provided headers (including `Authorization`), sends Clerk cookies, and reads the
  existing `{ error }` response format.

### Validation

- Validate all untrusted input on the server with Zod.
- Shared schemas belong in `app/schemas` or the relevant feature module.
- Enforce body size limits and rate limits on public or expensive endpoints, following
  `app/api/contact/route.ts` and `app/api/pricing/predict/route.ts`.
- Validate file URLs/keys and ownership before deleting or downloading files.

### UI and styling

- Preserve the existing professional design system.
- Use the CSS variables/tokens in `app/theme-tokens.css` and `app/globals.css`; **do not hardcode
  colors** in components.
- Support light and dark themes (`dark:` variants and existing tokens).
- Keep layouts responsive and consistent with neighboring pages.
- Use shadcn/ui primitives from `components/ui`, `cn` from `lib/utils.ts`, and the existing
  icon libraries.
- Reuse loading skeletons (`components/dashboard-loading.tsx` and route `loading.tsx`).
- Avoid redesigns, spacing changes, or typography changes that were not requested.
- Do not inline user-facing text when the surrounding feature uses next-intl; add keys to
  **both** `messages/en.json` and `messages/ur.json`.

### i18n and routing

- All user-facing routes live under `app/[locale]`.
- Locale-aware navigation must use `Link`/`redirect`/`useRouter` from `i18n/navigation.ts`,
  not the plain Next.js equivalents, when preserving the locale matters.
- Supported locales are `en` and `ur`; `en` is the default and uses no prefix.
- Do not add a locale or change routing behavior without approval.

## 6. Security Standard

Security is a requirement, not an optional hardening step. Preserve every existing protection
and apply the following to new and changed code.

### Authentication and authorization

- Verify authentication on every protected server operation: actions, API route handlers, and
  server data functions they call.
- Enforce authorization and ownership on the server. Client-side checks and hidden UI are not
  authorization.
- Use the application role model (`CUSTOMER`, `EMPLOYEE`, `ADMIN`) with least privilege. Never
  infer a role from a client payload.
- Reject unauthenticated access with `401`, unauthorized access with `403`, and missing/foreign
  records with `404` rather than leaking existence.
- Prevent IDOR by scoping every read/write/delete to the authenticated owner unless the caller
  is authorized staff.
- Prevent privilege escalation: role changes, admin/employee actions, refunds, price overrides,
  and ownership reassignment must be re-authorized server-side.
- Preserve Clerk session handling, application-user synchronization, and Clerk webhook
  signature verification.

### API security

- Validate every untrusted input on the server with Zod: body, query, route params, headers,
  cookies, and file metadata.
- Reject unknown/extra fields where mass assignment is possible; never spread client objects
  directly into Prisma `create`/`update`.
- Return correct status codes (`400`, `401`, `403`, `404`, `413`, `429`, `500`, `502`) with safe
  JSON errors.
- Apply rate limits and body-size limits to sensitive or expensive endpoints, following
  `lib/rate-limit.ts`, `app/api/contact/route.ts`, and `app/api/pricing/predict/route.ts`.
- Protect cookie-authenticated state-changing requests against CSRF where applicable; do not
  rely on `SameSite` alone for sensitive mutations.
- Set `Cache-Control: no-store` (or `private, no-store`) on authenticated and sensitive
  responses; never cache user-specific data in shared caches.
- Do not expose stack traces, internal error details, secrets, or raw database errors.
- Validate and restrict redirect targets; never redirect to arbitrary client-supplied URLs.
- Preserve webhook signature verification and use timing-safe comparison for secrets/tokens.

### File and upload security

The application uses UploadThing and supports customer design uploads.

- Enforce maximum file size on the server and independently before persisting references.
- Restrict allowed file types/extensions to what the feature needs; reject executables, scripts,
  and unexpected macro-enabled documents.
- Validate uploaded file metadata and URLs server-side; accept only UploadThing hosts
  (`utfs.io`, `*.ufs.sh`).
- Verify ownership before download, delete, or reuse; scope queries by the authenticated user.
- Sanitize filenames (strip path separators, control characters, CRLF) and encode
  `Content-Disposition`; never trust client-supplied names.
- Serve private customer files through authorized routes with `private, no-store` caching; do
  not expose them via public buckets or guessable URLs.
- Delete stored files only after ownership and reference checks; preserve files referenced by
  existing orders when intended.
- Do not log file keys, download URLs, or customer file contents unnecessarily. Do not add
  malware scanning or storage infrastructure without approval.

### Supabase Realtime security

- Require RLS policies on realtime tables that match application authorization.
- Never treat client-side filters or channel names as authorization.
- Ensure customers receive only events they are authorized to access; scope subscriptions and
  payloads accordingly.
- Keep subscriptions centralized in `lib/realtime-bus.ts` and clean them up on unmount.
- Never expose the service-role key to client code; the browser uses only the anon key.
- Realtime handlers must invalidate/refetch through authorized endpoints; they must not bypass
  server checks.

### Secrets and data protection

- Keep secrets in server-only environment variables. Only `NEXT_PUBLIC_*` values may reach the
  browser, and they must never contain credentials.
- Never commit `.env` files, keys, tokens, or database URLs.
- Never log passwords, tokens, payment credentials, or sensitive customer data.
- Return only the fields the client needs; avoid leaking internal IDs or relations by accident.
- Sanitize/escape user-provided content before rendering; avoid `dangerouslySetInnerHTML`
  unless the content is sanitized with a reviewed sanitizer.
- Do not store raw card or payment credentials. If a payment provider is integrated, use its
  tokenized references rather than card data.

## 7. Performance and Fast Navigation Standard

Optimize for fast loading, navigation, rendering, API responses, and compilation without
weakening security or correctness. Optimize measured problems; do not add speculative
abstractions. Do not add Suspense, caching, dynamic imports, or extra components where they
provide no real benefit.

### Rendering

- Prefer Server Components by default and keep Client Components as small as reasonably
  possible.
- Add `"use client"` only for state, effects, browser APIs, event handlers, or client
  libraries. Do not convert a complete dashboard page to a Client Component for a local issue.
- Use Suspense and streaming where they improve perceived loading. Do not wrap every page in
  Suspense when it adds no benefit.
- Use route-level `loading.tsx` where appropriate; reuse existing skeletons.
- Do not block an entire page on independent, non-critical data. Split or stream non-critical
  sections, and run independent server queries concurrently.
- Avoid unnecessary hydration and client-side JavaScript.

### Navigation

- Reuse cached data when navigating between dashboard routes. For migrated customer dashboard
  data, use the TanStack Query cache rather than refetching on mount.
- Prevent duplicate API and database requests; do not fetch the same data independently in
  parent and child components.
- Avoid unnecessary refetching on mount or route change. Set `staleTime` from how often the data
  actually changes.
- Prefetch route data intentionally (see `lib/query/prefetch-user-dashboard.ts`), but never
  prefetch side-effectful endpoints such as reads that mark messages as seen.
- Preserve legitimate RSC navigation; do not disable it to avoid network requests.
- Do not use `router.refresh()` as a substitute for targeted cache invalidation.
- Preserve correct freshness and invalidation behavior after mutations and realtime events.

### Data fetching

- Fetch only required fields and relations.
- Avoid N+1 queries, unbounded reads, and repeated sequential requests.
- Paginate lists and admin tables with bounded page sizes.
- Prefer database-level aggregation/grouping over loading large datasets into JavaScript.
- Run independent queries concurrently when safe.
- Use targeted cache invalidation and prevent stale responses from overwriting newer data.
- Identify and eliminate duplicate server-side data fetching across layouts and pages using
  `React.cache()`, passing data down, or TanStack hydration, while preserving initial server
  rendering.

### Bundle optimization

- Avoid importing large libraries unnecessarily and import only the pieces used.
- Use dynamic imports for genuinely heavy client-only components when measurement shows a
  benefit; do not dynamically import every component.
- Keep server-only dependencies out of client bundles.
- Optimize icon imports (import individual icons rather than entire icon sets where practical).
- Avoid duplicate dependencies and unnecessary client-side polyfills.
- Analyze bundle size before introducing major optimizations; do not add analysis tooling
  without approval.
- Do not add libraries merely for speculative performance benefits.

### Images, fonts, and assets

- Use Next.js Image optimization where appropriate, with suitable dimensions and responsive
  `sizes`.
- Configure remote image hosts in `next.config.ts` (UploadThing hosts are already allowed); do
  not bypass the allowlist.
- Prioritize only genuinely critical above-the-fold images; lazy-load below-the-fold media.
- Use optimized font loading (`next/font`) and avoid layout shifts (reserve dimensions).
- Avoid loading unnecessary large assets; prefer modern image formats.
- Private customer files must still go through authorized download routes, not public image
  optimization.

### React Compiler

The project already enables React Compiler in `next.config.ts`.

- Write components with correct React patterns, pure rendering, and correct hook usage.
- Avoid unnecessary manual memoization; React Compiler handles most cases.
- Do not disable React Compiler to work around a poorly understood issue.
- Use `useMemo`, `useCallback`, and `memo` when justified by correctness or measured
  performance, not by habit.
- Avoid unnecessary component re-renders and unstable props that defeat memoization.

### Database and API performance

- Follow the database rules in **Architecture Rules → Database**.
- Inspect generated SQL or query plans when investigating slow queries.
- Identify missing index opportunities and propose them for approval; do not add indexes
  directly.
- Treat new N+1 queries, unbounded reads, and repeated sequential requests as regressions.
- Measure API response time, request counts, and database query duration before and after
  performance changes.
- Do not change indexes, schema, migrations, or connection configuration without explicit
  approval; preserve the existing pool and a single Prisma client.

## 8. Compilation and Build Reliability

Existing checks:

```bash
npx tsc --noEmit
npm run build
npm run prisma:generate
```

- Distinguish TypeScript errors, Next.js compilation errors, build errors, Prisma generation
  errors, hydration errors, runtime errors, browser console errors, and lint errors (only if a
  lint configuration exists; none exists today).
- Do not invent scripts that do not exist.
- Do not claim a build succeeded without executing it.
- Avoid unnecessary dependency or configuration changes.
- Preserve strict TypeScript. Resolve errors with proper types and narrowing instead of `any`,
  unsafe assertions, `@ts-ignore`, or broad error suppression.
- Avoid circular imports and invalid server/client module boundaries; check that `"use client"`
  modules never import `server-only` code.
- Respect the Windows Prisma engine file-locking constraint: stop the dev server before
  `prisma generate` or `npm run build`.
- If a check cannot run, report exactly which command failed or was skipped and why.

## 9. Strict Task Rules

- Implement only what the user requested.
- Do not refactor unrelated code.
- Do not remove existing functionality without approval.
- Do not install or upgrade dependencies without approval.
- Do not change database architecture, schema, migrations, indexes, pooling, or infrastructure
  without approval.
- Do not introduce Redis, a new query library, or another architectural technology unless the
  user explicitly requests it. The approved TanStack Query migration is incremental; do not
  migrate unmigrated modules or expand TanStack Query beyond that approval.
- Do not replace working implementations unnecessarily.
- Do not claim something is tested or working unless it was actually verified.
- If a requirement is ambiguous or potentially destructive, ask before proceeding.
- Preserve intentional legacy names, including the `(dashborad)` route group and the
  `/api/admin-message/latest-converstaion` endpoint spelling, unless asked to rename them.

## 10. Required Workflow

1. **Understand** the requirement and the expected behavior.
2. **Inspect** the relevant existing implementation and conventions.
3. **Identify** dependencies, risks, authorization boundaries, side effects, and performance
   implications.
4. **Explain** the approach and provide an estimated duration before significant or
   cross-cutting changes. If the work is expected to take significant time, ask for permission
   and wait for approval before starting.
5. **Implement** incrementally, keeping the application working at each step.
6. **Verify** the changed flow, authorization, ownership, related integrations, and (for
   performance work) before-and-after measurements. Run the applicable checks before asking the
   user to approve the result or proceed to a dependent task.
7. **Check** with `npx tsc --noEmit`, then `npm run build` when the environment allows it and the
   dev server is stopped. There is no lint script or automated test script.
8. **Report** modified files, what changed, verification results, remaining issues, performance
   measurements when relevant, and the estimated versus actual time taken.

For risky database, auth, upload, payment, pricing, or realtime changes, explain the plan and
wait for approval before making destructive edits.

## 11. Definition of Done

A task is complete only when:

- The requested behavior is implemented without unrelated changes.
- Authorization and ownership checks remain correct.
- Inputs are validated on the server.
- Prisma queries are bounded and do not introduce N+1 patterns.
- Client/server boundaries are serializable and do not leak server-only code.
- Server data has one owner; it is not duplicated across TanStack Query and Zustand.
- No unnecessary Client Component boundary or duplicate data fetch was introduced.
- Existing realtime subscriptions still clean up correctly.
- Light/dark and responsive behavior is preserved.
- Type-checking passes, or the exact remaining errors are reported.
- For performance work, before/after measurements are reported or their absence is explained.
- The final report distinguishes verified facts from unverified assumptions.

## 12. Reporting Format

Use a concise final report:

```text
Changed:
- path/to/file.ts — what changed and why

Verified:
- npx tsc --noEmit — passed
- tests/checks executed — results
- route/API smoke checks — results

Not verified:
- tests that could not run, and why
- authenticated UI flows, if no Clerk session was available

Performance (when relevant):
- before/after measurements, or why they were not collected

Time:
- estimated: ...
- actual: ...

Notes:
- migrations, approvals, or follow-up work
```

## 13. Agent Instruction Files

`AGENTS.md` at the repository root is the canonical instruction file. Do not create duplicate
rule files (`CLAUDE.md`, `.cursor/rules`, etc.) with copied content. If another tool requires a
specific filename, create a short pointer that says to read this file instead of maintaining a
second copy. Tool-specific skills under `.agents/` are separate and should not contain
project-wide rules.

## 14. Production Reliability, Testing & Observability

### Production Reliability

- Design features to handle expected failures gracefully (database errors, timeouts, upstream
  5xx responses, missing records, and partial failures).
- Protect critical operations against duplicate submissions and unintended repeated execution.
- Use database transactions for operations that must be atomic.
- Implement idempotency where appropriate, especially for payments, order creation, uploads,
  messaging, and external service calls.
- Handle database, network, and third-party service failures safely; surface a safe, actionable
  error and preserve the existing data.
- Never compromise data consistency for performance.
- Use database transactions, unique constraints, or idempotency keys rather than client-side
  assumptions.

### Testing Standards

- Verify proportionally to the change. Run the applicable checks **before** requesting approval
  or sign-off; do not ask the user to approve unverified work.
- Add unit tests for critical business logic when a test setup exists.
- Add integration tests for important APIs and server actions when a test setup exists.
- Test authentication, authorization, customer data ownership (IDOR), and role-based access.
- Test API validation: invalid/missing/extra fields, body-size limits, and rate limiting.
- Test realtime behavior for regressions: subscription cleanup, duplicate events, and missed
  updates.
- Test TanStack Query caching, invalidation, and mutation behavior in migrated modules.
- Verify navigation does not introduce duplicate fetches or unnecessary refetches.
- Check responsive behavior and light/dark modes for UI changes.
- Perform regression testing on related functionality after changes.
- Use end-to-end tests for critical customer and admin workflows when the existing testing
  infrastructure supports them.
- There is no test framework configured today. Do not add one without explicit approval; use
  manual verification and report exactly what was checked when automated tests are unavailable.
- If tests cannot run (missing framework, environment, credentials, or fixture data), state
  exactly what was not run and why.
- Never claim functionality is verified without executing the appropriate tests or checks.

For performance-related changes, collect before-and-after measurements where possible: LCP,
INP, CLS, JavaScript bundle size, API response time, database query duration, number of repeated
requests, and navigation loading behavior. Never claim an optimization improved performance
without evidence.

### Approval, Time Estimates, and Long-Running Work

- Before starting work expected to take significant time, ask for permission first and state
  the estimated duration and scope.
- Significant time includes, at minimum: full builds, end-to-end suites, database migrations,
  dependency installation, bulk data operations, broad refactors, repeated external service
  calls, or any task expected to exceed roughly 10–15 minutes.
- Do not start a long-running operation merely because it is convenient or already in progress;
  wait for approval when the task is destructive, expensive, or slow.
- Track and report both the estimated duration and the actual elapsed time in the final report.
- If a long task runs materially longer than estimated, explain the delay and the remaining work.

### Performance Standards

- Follow the **Performance and Fast Navigation Standard** in Section 7.
- Verify improvements with before-and-after measurements where possible and report the metrics
  used (LCP, INP, CLS, bundle size, API response time, database query duration, repeated
  requests, navigation behavior).
- Do not claim a performance win without evidence, and do not optimize without an identified
  problem.

### Observability

- Use structured, contextual server-side logging for important operations and failures.
- Include useful context (operation, entity ID, outcome, duration) without logging credentials,
  tokens, secrets, or sensitive customer information.
- Preserve actionable error information for debugging while returning safe messages to users.
- Identify bottlenecks through profiling and performance measurements.
- Do not add monitoring, tracing, or logging infrastructure without approval.

### Accessibility

- Use semantic HTML and accessible UI components.
- Support keyboard navigation and appropriate focus management.
- Provide accessible form labels and validation feedback.
- Ensure loading, error, empty, and success states are understandable to assistive technology.
- Preserve accessibility when modifying existing components.
- Do not introduce click-only controls, unlabeled inputs, or focus traps.

### Production Readiness

- Consider security, reliability, maintainability, scalability, and performance together.
- Avoid introducing breaking changes without explicit approval.
- Consider deployment and environment compatibility before modifying infrastructure.
- Ensure critical business workflows remain reliable after implementation.
- Leave the application in a working state after every incremental change.

## 15. Landing Page Section-by-Section Redesign

The public landing page (`app/[locale]/(main)/page.tsx`) is the active workstream. It is being
rebuilt **one section at a time** against a reference UI supplied by the user. Every rule in this
file still applies; this section adds the landing-page-specific requirements.

### Scope and Workflow

- Work on **one section per task** unless the user explicitly asks for several. A section is one
  of the components composed by the landing page: hero, trusted-by, about, print process,
  services, testimonials, FAQ, contact, action banner (currently in `components/ui/Hero.tsx`,
  `components/trusted-by-section.tsx`, `components/about.tsx`,
  `components/print-process-section.tsx`, `components/services-section.tsx`,
  `components/testimonial2-section.tsx`, `components/faqs-section.tsx`,
  `components/contact-section.tsx`, `components/action-banner.tsx`).
- The reference UI is the source of truth for the requested section. If the reference
  (screenshot, Figma, link, or spec) for that section is not available, **ask for it before
  restyling**. Do not invent a different visual direction or "improve" the reference.
- Restyle only the requested section. Do not rework other sections, the page order, the header,
  the footer, or the design tokens unless the task explicitly includes them.
- Preserve existing behavior, data dependencies, links, forms, and integrations while changing
  presentation. Never delete a section's content or functionality to match a simpler mock.
- Do not migrate unrelated landing code to new patterns, libraries, or state layers as part of a
  visual task.

### Design Fidelity

- Match the reference for layout, spacing rhythm, type scale, colors, radii, borders, shadows,
  iconography, and breakpoint behavior.
- Use the project design tokens and `dark:` variants; never hardcode colors. Reuse shadcn/ui
  primitives and `cn` from `lib/utils.ts`.
- Keep light and dark themes both correct, even if the reference shows only one.
- If the reference implies a token, font, or asset that does not exist, ask before adding a
  dependency, font, or asset pipeline.

### Responsive Behavior (Required)

- Build mobile-first and verify at minimum: `360px`, `390px`, `640px`, `768px`, `1024px`,
  `1280px`, `1440px`, and a large `1920px` viewport.
- No horizontal overflow, clipped text, overlapping layers, or content hidden behind fixed
  elements at any breakpoint. The page shell already uses `overflow-x-hidden`; do not rely on it
  to hide broken layout.
- Collapse multi-column layouts cleanly, stack cards, resize typography fluidly, and keep media
  responsive with appropriate `sizes` and aspect ratios.
- Keep interactive targets at least ~44px on touch, and verify the section does not break the
  existing mobile navigation behavior.
- Test long Urdu copy as well as English; Urdu strings frequently wrap differently.

### Localization (English and Urdu) � Required

- Every user-facing string in the section must come from next-intl, never hardcoded.
- Add or update keys in **both** `messages/en.json` and `messages/ur.json` in the same change.
  A section is not done until both locales render correctly.
- Reuse existing keys where they already fit; do not duplicate text under new names.
- Do not use fixed widths, `h-*`, truncation, or `whitespace-nowrap` in places where Urdu text
  would clip.
- Urdu is right-to-left. Use logical utilities and properties (`ms-`/`me-`, `ps-`/`pe-`,
  `start-`/`end-`, `text-start`/`text-end`) instead of hardcoded left/right where possible, and
  mirror directional icons, arrows, carousels, and slide animations so they read correctly in
  RTL.
- Known gap: `app/layout.tsx` hardcodes `<html lang="en">` and sets no `dir`. Making the landing
  page truly locale-aware requires `lang`/`dir` driven by the active locale. Changing the root
  layout affects every route, so include that plan in the task and get explicit approval before
  applying it; do not leave a half-applied direction change.
- Locale-aware navigation must use `Link`/`useRouter` from `i18n/navigation.ts`.

### Framer Motion Animation Standard (Required)

Framer Motion is mandatory for every landing section, and animations must feel deliberate and
high-end � not decorative noise. Hero and testimonials are the flagship sections and must use
the most advanced, polished treatment. See `components/ui/Hero.tsx` and
`components/testimonial2-section.tsx` for the existing baseline.

- Use the already-installed Framer Motion (`framer-motion` or `motion/react`). Do not add
  animation libraries or replace Framer Motion.
- Each animated component needs `"use client"`; keep it a leaf. The landing page and any
  data-fetching parent stay Server Components. Do not convert the whole page to a client
  component for animation.
- Use scroll reveals with `whileInView` and `viewport={{ once: true }}` plus variants and
  staggerChildren for section entrances.
- Advanced techniques are expected where they fit the reference: orchestrated variants,
  spring physics, parallax via `useScroll`/`useTransform`, text/line reveal masks, hover and tap
  micro-interactions, card tilt/spotlight, AnimatePresence transitions for testimonial sliders,
  and marquees for the trusted-by strip. Do not animate everything simultaneously; establish
  hierarchy.
- Animate GPU-friendly properties (transform, opacity, filter). Avoid animating layout
  properties such as width/height/top/left, and avoid large `box-shadow`/`blur` animations on
  big surfaces.
- No layout shift and no invisible content: reserve space, keep initial states readable, and do
  not delay hero text behind long entrance delays. Hero content must be legible almost
  immediately and must not hurt LCP.
- Respect `prefers-reduced-motion` everywhere via `useReducedMotion` (existing sections already
  do). The reduced-motion version must be fully usable with all content visible and all
  functionality intact.
- Avoid infinite loops, timers, and scroll listeners without cleanup; remove them on unmount and
  disable them under reduced motion. Do not create animation-driven feedback loops with
  realtime or query data.
- Keep animations deterministic: no `Math.random()` or time-based values in render, to prevent
  hydration mismatches. Avoid `AnimatePresence` around server-rendered content that must exist
  on first paint.
- Accessibility: motion is never the only signal, focus states remain visible and reachable,
  and keyboard users can reach every control regardless of animation state.

### Functionality (Nothing May Break)

- Every button, link, form, CTA, language link, and navigation affordance in the section must
  work in both locales. No dead buttons and no placeholder-only UI.
- Purchase/order, contact, and auth-related CTAs must keep their existing destinations and
  behavior. Client validation and server validation stay intact; never trust client-only checks.
- Preserve existing accessibility semantics (headings, lists, labels, alt text, aria attributes,
  landmarks) when replacing markup.
- Preserve images and media behavior: use `next/image` where appropriate, keep allowed remote
  hosts, and keep meaningful `alt` text localized.

### Performance

- Keep the animation and interactive surface small; avoid wrapping large static trees in client
  components.
- Do not introduce duplicate data fetching, new API calls, or extra client state for animation.
- Prefer CSS for simple transitions, Framer Motion for orchestration/scroll-linked effects.
- Lazy-load genuinely heavy media below the fold; do not lazy-load hero LCP media.

### Verification Checklist (Per Section)

1. `npx tsc --noEmit` passes. Run `npm run build` when the dev server is stopped and the
   environment allows it.
2. Section renders correctly at every width listed above, in light and dark themes.
3. `/en` and `/ur` both render with no missing keys; layout and animation direction are correct
   in RTL.
4. All interactive elements work; no console or hydration errors.
5. Reduced-motion mode is usable and content-complete.
6. Neighboring sections and the page shell are visually and functionally unchanged.
7. Report exactly what was verified and what could not be verified (for example, no Clerk session
   for authenticated flows).

### Done Criteria for a Landing Section

- Visual result matches the supplied reference at all breakpoints.
- All copy is localized in `en` and `ur`, with correct RTL behavior.
- Framer Motion animation is present, advanced, hierarchical, reduced-motion safe, and free of
  layout shift or hydration issues.
- Every control is functional and existing behavior is preserved.
- Type-check passes; no regressions in other sections.
