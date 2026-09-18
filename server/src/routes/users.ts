import { Router } from "express";
import { prisma } from "../db.js";
import { AuthRequest, requireAuth } from "../auth.js";

const router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { engineer: { include: { certificates: true, projects: true } }, worker: true, company: true, student: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const users = await prisma.user.findMany({
      where: { ...(role ? { role: role as any } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { location: { contains: search, mode: "insensitive" } }] } : {}) },
      select: { id:true, name:true, role:true, location:true, availability:true, verified:true, bio:true, avatarUrl:true },
      take: 50
    });
    res.json(users);
  } catch (e) { next(e); }
});

export default router;