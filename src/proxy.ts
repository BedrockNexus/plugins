import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

/** Origins of the Convex deployment (HTTPS and WebSocket) for connect-src. */
function convexOrigins(): string[] {
  const origins = new Set<string>();
  for (const value of [
    process.env.NEXT_PUBLIC_CONVEX_URL,
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  ]) {
    if (!value) continue;
    try {
      const url = new URL(value);
      origins.add(url.origin);
      origins.add(`${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}`);
    } catch {
      // Ignore malformed configuration; the app fails elsewhere with a clear error.
    }
  }
  return [...origins];
}

/**
 * Per-request Content Security Policy. Scripts run only with this request's
 * nonce ('strict-dynamic' lets those scripts load their own chunks); Next.js
 * applies the nonce to its scripts automatically, and the root layout passes
 * it to next-themes. Inline styles stay allowed because Base UI and CodeMirror
 * position elements with style attributes, which nonces cannot cover.
 */
export function buildContentSecurityPolicy(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${convexOrigins().join(" ")}${isDev ? " ws: wss:" : ""}`.trim(),
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://github.com",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optimistic redirect for signed-out visitors before protected pages render,
  // so their data queries never run unauthenticated. The (authenticated) and
  // (admin) layouts and every Convex function still enforce authorization.
  const protectedPrefix = PROTECTED_PREFIXES.find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (protectedPrefix && !getSessionCookie(request)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?redirectTo=${protectedPrefix}`;
    return NextResponse.redirect(login);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV === "development");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: API routes, downloads, and static assets need no CSP.
      source:
        "/((?!api|download|_next/static|_next/image|favicon.png|icon.png|images|robots.txt|sitemap.xml|opengraph-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
