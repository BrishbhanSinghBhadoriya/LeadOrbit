import { cookies } from "next/headers";
import { verifyAccess } from "./jwt";
import type { JwtPayload, Role } from "@/types";
import { can, type Permission } from "@/config/rbac";

export const ACCESS_COOKIE = "edu_crm_access";
export const REFRESH_COOKIE = "edu_crm_refresh";

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const c = await cookies();
  const token = c.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifyAccess(token);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Response("Unauthorized", { status: 401 });
  return u;
}

export async function requirePermission(p: Permission) {
  const u = await requireUser();
  if (!can(u.role as Role, p)) throw new Error("Forbidden");
  return u;
}

export function canCreateRole(creatorRole: Role, targetRole: Role): boolean {
  if (creatorRole === "super_admin") {
    return ["admin", "general_manager"].includes(targetRole);
  }
  if (creatorRole === "general_manager") {
    return ["manager", "team_leader", "counselor", "it", "hr"].includes(targetRole);
  }
  return false;
}
