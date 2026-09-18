import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

const secret = process.env.JWT_SECRET || "development-secret";

export function signToken(userId: string, role: Role) {
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "7d" });
}

export interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required" });
  try {
    const payload = jwt.verify(header.slice(7), secret) as { sub: string; role: Role };
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function allowRoles(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}