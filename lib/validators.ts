import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum([
    "super_admin","admin","general_manager","senior_manager",
    "manager","junior_manager","team_leader","counselor",
  ]).optional(),
});

export const leadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  altPhone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  state: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  courseId: z.string().optional(),
  universityId: z.string().optional(),
  source: z.enum([
    "website","facebook","google_ads","instagram",
    "referral","walkin","csv_import","other",
  ]).default("other"),
  status: z.enum([
    "new","attempted","interested","follow_up","hot",
    "admission_processing","documents_pending","payment_pending",
    "admission_confirmed","converted","closed","not_interested",
  ]).default("new"),
  assignedTo: z.string().optional(),
  notes: z.string().max(2000).optional(),
  followUpAt: z.coerce.date().optional(),
});

export const universitySchema = z.object({
  name: z.string().min(2).max(160),
  shortName: z.string().max(40).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
  active: z.boolean().default(true),
});

export const courseSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().max(40).optional(),
  level: z.enum(["UG","PG","Diploma","Certificate"]),
  durationMonths: z.number().int().min(1).max(120),
  fees: z.number().min(0),
  eligibility: z.string().max(1000).optional(),
  brochureUrl: z.string().url().optional().or(z.literal("")),
  specializations: z.array(z.string().max(120)).optional(),
  universityId: z.string(),
  active: z.boolean().default(true),
});

export const followUpSchema = z.object({
  leadId: z.string(),
  scheduledAt: z.coerce.date(),
  note: z.string().max(1000).optional(),
});
