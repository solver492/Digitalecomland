import type { NextFunction, Request, Response } from "express";
import { requireSupabase, type AuthenticatedUser } from "../lib/supabase";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      profileRole?: "affiliate" | "admin";
    }
  }
}

function bearerToken(req: Request): string | null {
  const header = req.header("authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function loadRole(userId: string): Promise<"affiliate" | "admin"> {
  const supabase = requireSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "admin" ? "admin" : "affiliate";
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const { data, error } = await requireSupabase().auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired access token" });
      return;
    }
    req.user = data.user;
    req.profileRole = await loadRole(data.user.id);
    next();
  } catch {
    res.status(503).json({ error: "Authentication service unavailable" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    await requireAuth(req, res, () => undefined);
    if (!req.user) return;
  }
  if (req.profileRole !== "admin") {
    res.status(403).json({ error: "Administrator access required" });
    return;
  }
  next();
}