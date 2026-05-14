import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_COOKIE = "edu_crm_access";
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
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
