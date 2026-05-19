import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signAccess, signRefresh } from "@/lib/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE, getCurrentUser, canCreateRole } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators";
import type { Role } from "@/types";

const isProd = process.env.NODE_ENV === "production";
const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  path: "/",
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "login";
  const body = await req.json();
  await connectDB();

  if (action === "register") {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = registerSchema.parse(body);
    const targetRole = (data.role ?? "counselor") as Role;

    if (!canCreateRole(currentUser.role, targetRole)) {
      return NextResponse.json({ error: `You are not allowed to create a ${targetRole}` }, { status: 403 });
    }

    const exists = await User.findOne({ email: data.email });
    if (exists) return NextResponse.json({ error: "Email in use" }, { status: 409 });
    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: targetRole,
      managerId: currentUser.sub,
    });
    return NextResponse.json({ id: user._id });
  }

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, "", { ...cookieBase, maxAge: 0 });
    res.cookies.set(REFRESH_COOKIE, "", { ...cookieBase, maxAge: 0 });
    return res;
  }

  // login
  const data = loginSchema.parse(body);
  const user = await User.findOne({ email: data.email });
  if (!user || !user.active) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const payload = { sub: String(user._id), email: user.email, role: user.role as Role, name: user.name };
  const access = signAccess(payload);
  const refresh = signRefresh(payload);
  
  // Faster update using findOneAndUpdate
  await User.findOneAndUpdate(
    { _id: user._id },
    { 
      $set: { lastLoginAt: new Date() },
      $push: { refreshTokens: { $each: [refresh], $slice: -5 } }
    }
  );

  const res = NextResponse.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(ACCESS_COOKIE, access, { ...cookieBase, maxAge: 60 * 15 });
  res.cookies.set(REFRESH_COOKIE, refresh, { ...cookieBase, maxAge: 60 * 60 * 24 * 7 });
  return res;
}
