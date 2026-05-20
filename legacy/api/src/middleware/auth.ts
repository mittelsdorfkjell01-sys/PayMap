import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  adminId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    // JWT_SECRET is validated at startup in index.ts
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.adminId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
