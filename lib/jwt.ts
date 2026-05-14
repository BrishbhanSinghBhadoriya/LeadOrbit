import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload } from "@/types";

const ACCESS = process.env.JWT_ACCESS_SECRET!;
const REFRESH = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES ?? "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES ?? "7d") as SignOptions["expiresIn"];

export const signAccess = (p: JwtPayload) =>
  jwt.sign(p, ACCESS, { expiresIn: ACCESS_EXPIRES });

export const signRefresh = (p: JwtPayload) =>
  jwt.sign(p, REFRESH, { expiresIn: REFRESH_EXPIRES });

export const verifyAccess = (t: string) => jwt.verify(t, ACCESS) as JwtPayload;
export const verifyRefresh = (t: string) => jwt.verify(t, REFRESH) as JwtPayload;
