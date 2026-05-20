import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Simple in-memory rate limiter: max 5 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count++;
  return false;
}

router.post("/login", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim() ?? req.socket.remoteAddress ?? "unknown";

  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many login attempts. Try again later." });
    return;
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // JWT_SECRET is validated at startup in index.ts
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "8h",
  });

  res.json({ token });
});

export default router;
