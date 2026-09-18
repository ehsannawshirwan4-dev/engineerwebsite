import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../db.js";
import { signToken } from "../auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(Role),
  location: z.string().optional()
});

router.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({ data: { ...input, passwordHash } });
    const token = signToken(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const input = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: signToken(user.id, user.role), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

export default router;