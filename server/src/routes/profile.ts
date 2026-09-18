import { Router } from "express";
import { prisma } from "../db.js";
import { AuthRequest, requireAuth } from "../auth.js";

const router = Router();

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, userId?: string) {
  const clean = slugify(base) || "profile";
  let slug = clean;
  let i = 2;
  while (true) {
    const existing = await prisma.publicProfile.findUnique({ where: { slug } });
    if (!existing || existing.userId === userId) return slug;
    slug = `${clean}-${i++}`;
  }
}

const publicInclude = {
  user: { select: { id: true, name: true, role: true, email: true, phone: true, location: true, bio: true, avatarUrl: true, availability: true, verified: true } },
};

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true, engineer: { include: { certificates: true, projects: true } }, worker: true, company: true, student: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
});

router.put("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = req.body ?? {};
    const allowed = ["headline", "summary", "professionalTitle", "education", "experience", "skills", "languages", "interests", "achievements", "cvUrl", "visibility"];
    const data: any = {};
    for (const key of allowed) if (body[key] !== undefined) data[key] = body[key];
    if (data.skills && !Array.isArray(data.skills)) return res.status(400).json({ error: "skills must be an array" });
    if (data.languages && !Array.isArray(data.languages)) return res.status(400).json({ error: "languages must be an array" });
    if (data.interests && !Array.isArray(data.interests)) return res.status(400).json({ error: "interests must be an array" });
    if (data.achievements && !Array.isArray(data.achievements)) return res.status(400).json({ error: "achievements must be an array" });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, bio: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const current = await prisma.publicProfile.findUnique({ where: { userId: user.id } });
    const slug = current?.slug ?? await uniqueSlug(user.name, user.id);

    const profile = await prisma.publicProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, slug, skills: [], ...data }, update: data });
    if (body.name !== undefined || body.phone !== undefined || body.location !== undefined || body.bio !== undefined || body.avatarUrl !== undefined) {
      await prisma.user.update({ where: { id: user.id }, data: { name: body.name, phone: body.phone, location: body.location, bio: body.bio, avatarUrl: body.avatarUrl } });
    }
    res.json(profile);
  } catch (e) { next(e); }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const profile = await prisma.publicProfile.findUnique({ where: { slug: req.params.slug }, include: publicInclude });
    if (!profile || profile.visibility !== "PUBLIC") return res.status(404).json({ error: "Public profile not found" });
    res.json(profile);
  } catch (e) { next(e); }
});

export default router;
