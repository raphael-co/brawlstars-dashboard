import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["fr", "en"] as const;
type Locale = (typeof LOCALES)[number];

function detectLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value as Locale | undefined;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie;
  const al = req.headers.get("accept-language") || "";
  const first = al.split(",")[0]?.trim().toLowerCase();
  return first?.startsWith("fr") ? "fr" : "en";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) return NextResponse.next();

  const seg1 = pathname.split("/")[1];
  if ((LOCALES as readonly string[]).includes(seg1)) return NextResponse.next();

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
