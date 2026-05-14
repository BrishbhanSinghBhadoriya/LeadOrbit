export type Role =
  | "super_admin"
  | "admin"
  | "general_manager"
  | "manager"
  | "team_leader"
  | "counselor"
  | "it"
  | "hr";

export type LeadStatus =
  | "new"
  | "attempted"
  | "interested"
  | "follow_up"
  | "hot"
  | "admission_processing"
  | "documents_pending"
  | "payment_pending"
  | "admission_confirmed"
  | "converted"
  | "closed"
  | "not_interested";

export type LeadSource =
  | "website"
  | "facebook"
  | "google_ads"
  | "instagram"
  | "referral"
  | "walkin"
  | "csv_import"
  | "other";

export type CourseLevel = "UG" | "PG" | "Diploma" | "Certificate";

export interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
  name?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
