import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const PUBLIC_API_PREFIXES = ["/api/v1/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always inject the pathname so the layout can read it
  const injectPathname = (res: NextResponse) => {
    res.headers.set("x-pathname", pathname);
    return res;
  };

  // Allow public API v1 (uses per-number API key, not session)
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return injectPathname(NextResponse.next());
  }

  // Allow public pages
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return injectPathname(NextResponse.next());
  }

  // Get session token
  const token = request.cookies.get("session")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return injectPathname(
      NextResponse.redirect(new URL("/login", request.url))
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("session");
    return injectPathname(res);
  }

  // Admin-only protection
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    payload.role !== "ADMIN"
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return injectPathname(NextResponse.redirect(new URL("/", request.url)));
  }

  // Inject user info as headers for server components / API routes
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  response.headers.set("x-user-id", payload.userId);
  response.headers.set("x-user-role", payload.role);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
