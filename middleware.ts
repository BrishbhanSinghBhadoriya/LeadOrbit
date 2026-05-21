import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const ACCESS_COOKIE = "edu_crm_access";
const REFRESH_COOKIE = "edu_crm_refresh";

// Routes that don't need auth
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth",
  "/api/leads/public",
  "/_next",
  "/favicon",
  "/public",
];

const encoder = new TextEncoder();

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // No tokens at all → redirect to login
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Try access token first
  if (accessToken) {
    try {
      await jwtVerify(accessToken, encoder.encode(process.env.JWT_ACCESS_SECRET!));
      // Valid — pass through
      return NextResponse.next();
    } catch {
      // Access token expired or invalid — fall through to refresh
    }
  }

  // Try refresh token
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(
      refreshToken,
      encoder.encode(process.env.JWT_REFRESH_SECRET!)
    );

    // Issue new access token
    const newAccess = await new SignJWT({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_ACCESS_EXPIRES ?? "8h")
      .sign(encoder.encode(process.env.JWT_ACCESS_SECRET!));

    // For API routes: return 401 so client can handle it
    if (pathname.startsWith("/api/")) {
      const res = NextResponse.next();
      res.cookies.set(ACCESS_COOKIE, newAccess, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return res;
    }

    // For page routes: redirect to same page with new cookie set
    const res = NextResponse.redirect(req.url);
    res.cookies.set(ACCESS_COOKIE, newAccess, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  } catch {
    // Refresh token also expired → force login
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set(ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
    res.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
