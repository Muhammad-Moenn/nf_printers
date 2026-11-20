import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_ROUTE = /\/(admin-dashboard|user-dashboard)(\/|$)/;
const AUTH_ROUTE = /\/(sign-in|sign-up|forgot-password)(\/|$)/;

// API routes that require a signed-in user. Role checks (e.g. ADMIN) still
// happen inside each route/action because middleware cannot query the database.
// Public endpoints (contact, Clerk webhooks, auth/me) are intentionally absent.
const PROTECTED_API =
  /^\/api\/(admin-message|user-message|orders|user|pricing|uploadthing\/delete)(\/|$)/;

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

function getLocaleFromPathname(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return (routing.locales as readonly string[]).includes(firstSegment)
    ? firstSegment
    : routing.defaultLocale;
}

function localizedPath(pathname: string, locale: string) {
  return locale === routing.defaultLocale ? pathname : `/${locale}${pathname}`;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const isServerAction =
    request.method === "POST" && request.headers.has("next-action");

  if (PROTECTED_ROUTE.test(pathname)) {
    const { userId } = await auth();
    if (!userId) {
      // Server actions cannot be redirected to a sign-in page without breaking
      // the action protocol, so reject them with 401 instead of skipping the
      // auth check. Actions still verify the session themselves because the
      // action ID (not the POST path) identifies what is executed.
      if (isServerAction) {
        return unauthorizedResponse();
      }

      const signInUrl = new URL(
        localizedPath("/sign-in", locale),
        request.url,
      );
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (PROTECTED_API.test(pathname)) {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }
  }

  if (AUTH_ROUTE.test(pathname) && !isServerAction) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(
        new URL(localizedPath("/user-dashboard", locale), request.url),
      );
    }
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/__clerk")
  ) {
    return;
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|ogv|ogg|mp3|wav|m4a|mov)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
