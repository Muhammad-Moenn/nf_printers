import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const handleI18nRouting = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/",
  "/(en|ur)?/sign-in(.*)",
  "/(en|ur)?/sign-up(.*)",
  "/api/uploadthing(.*)",
  "/api/orders/realtime", // ✅ ADD THIS
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ✅ 1. ALWAYS skip middleware logic for API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ✅ 2. Handle i18n ONLY for pages
  const i18nResponse = handleI18nRouting(req);

  // ✅ 3. Protect non-public page routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return i18nResponse;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}