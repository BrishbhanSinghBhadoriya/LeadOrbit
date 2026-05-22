import type { Role } from "@/types";

export const ROLE_HIERARCHY: Role[] = [
  "super_admin",
  "admin",
  "general_manager",
  "manager",
  "team_leader",
  "counselor",
  "it",
  "hr",
];

export const roleRank = (r: Role) => ROLE_HIERARCHY.indexOf(r);

/** True if `actor` is at or above `target` in hierarchy. */
export const isAtLeast = (actor: Role, target: Role) =>
  roleRank(actor) <= roleRank(target);

export type Permission =
  | "leads.view.all"
  | "leads.view.team"
  | "leads.view.own"
  | "leads.create"
  | "leads.update"
  | "leads.delete"
  | "leads.assign"
  | "leads.import"
  | "leads.export"
  | "leads.call"
  | "users.view.all"
  | "users.view.team"
  | "users.create.admin"
  | "users.create.gm"
  | "users.create.manager"
  | "users.create.tl"
  | "users.create.counselor"
  | "users.create.it"
  | "users.create.hr"
  | "users.manage"
  | "teams.manage"
  | "work.assign"
  | "meetings.schedule"
  | "universities.manage"
  | "courses.manage"
  | "reports.view.all"
  | "reports.view.team"
  | "settings.manage"
  | "audit.view";

export const PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "reports.view.all",
    "users.view.all",
    "users.create.admin",
    "users.create.gm",
    "users.create.manager",
    "users.create.tl",
    "users.create.counselor",
    "users.create.it",
    "users.create.hr",
    "users.manage",
    "teams.manage",
    "leads.view.all",
    "leads.create",
    "leads.update",
    "leads.delete",
    "leads.assign",
    "leads.call",
    "leads.import",
    "leads.export",
    "universities.manage",
    "courses.manage",
    "settings.manage",
    "work.assign",
    "meetings.schedule",
    "audit.view",
  ],
  admin: [
    "leads.view.all",
    "work.assign",
    "meetings.schedule",
    "reports.view.all",
    "users.view.all",
    "settings.manage",
  ],
  general_manager: [
    "leads.view.all",
    "leads.create",
    "leads.update",
    "leads.delete",
    "leads.assign",
    "leads.call",
    "leads.import",
    "leads.export",
    "users.view.all",
    "users.create.manager",
    "users.create.tl",
    "users.create.counselor",
    "users.create.it",
    "users.create.hr",
    "users.manage",
    "teams.manage",
    "work.assign",
    "universities.manage",
    "courses.manage",
    "reports.view.all",
    "meetings.schedule",
    "settings.manage",
  ],
  manager: [
    "leads.view.team",
    "leads.assign",
    "leads.export",
    "reports.view.team",
    "work.assign",
    "users.view.team",
    "users.create.tl",
    "users.create.counselor",
  ],
  team_leader: [
    "leads.view.team",
    "leads.assign",
    "reports.view.team",
    "users.view.team",
    "users.create.counselor",
  ],
  counselor: ["leads.view.own", "leads.update", "leads.call"],
  it: ["settings.manage", "audit.view", "leads.view.all"],
  hr: ["users.view.all", "users.manage", "reports.view.all"],
};

export const can = (role: Role, perm: Permission) =>
  PERMISSIONS[role]?.includes(perm) ?? false;
