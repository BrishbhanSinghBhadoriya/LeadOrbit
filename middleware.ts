import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const ACCESS_COOKIE = "edu_crm_access";
const REFRESH_COOKIE = "edu_crm_refresh";
const PUBLIC = ["/login", "/register", "/forgot-password", "/api/auth"];

const encoder = new TextEncoder();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    await jwtVerify(token, encoder.encode(process.env.JWT_ACCESS_SECRET!));
    return NextResponse.next();
  } catch {
    // Access expired: try refresh cookie before forcing re-login.
    const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!refresh) return NextResponse.redirect(new URL("/login", req.url));
    try {
      const { payload } = await jwtVerify(refresh, encoder.encode(process.env.JWT_REFRESH_SECRET!));
      const nextAccess = await new SignJWT({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(process.env.JWT_ACCESS_EXPIRES ?? "15m")
        .sign(encoder.encode(process.env.JWT_ACCESS_SECRET!));

      const res = NextResponse.next();
      res.cookies.set(ACCESS_COOKIE, nextAccess, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 15,
      });
      return res;
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
