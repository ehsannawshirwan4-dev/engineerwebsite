import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AuthRequest, allowRoles, requireAuth } from "../auth.js";
import { Role, JobType } from "@prisma/client";

const router = Router();

router.get("/engineers", async (req, res, next) => {
  try {
    const q = typeof req.query.search === "string" ? req.query.search : undefined;
    const field = typeof req.query.field === "string" ? req.query.field : undefined;
    const availability = typeof req.query.availability === "string" ? req.query.availability : undefined;
    const rows = await prisma.engineerProfile.findMany({
      where: { ...(field ? { discipline: field } : {}), ...(q ? { OR: [{ user: { name: { contains:q, mode:"insensitive" } } }, { skills: { has: q } }] } : {}), ...(availability ? { user: { availability: availability as any } } : {}) },
      include: { user: { select: { id:true,name:true,email:true,location:true,availability:true,verified:true,avatarUrl:true } }, certificates:true, projects:true },
      take: 50
    });
    res.json(rows);
  } catch(e){ next(e); }
});

router.get("/workers", async (_req,res,next)=>{
  try { res.json(await prisma.workerProfile.findMany({ include:{ user:{select:{id:true,name:true,location:true,availability:true,verified:true}}}, take:50 })); }
  catch(e){ next(e); }
});

router.get("/companies", async (_req,res,next)=>{
  try { res.json(await prisma.companyProfile.findMany({ include:{ user:{select:{id:true,name:true,location:true,verified:true}}}, take:50 })); }
  catch(e){ next(e); }
});

router.get("/jobs", async (req,res,next)=>{
  try {
    const field=typeof req.query.field==="string"?req.query.field:undefined;
    const type=typeof req.query.type==="string"?req.query.type:undefined;
    const search=typeof req.query.search==="string"?req.query.search:undefined;
    res.json(await prisma.job.findMany({ where:{status:"OPEN",...(field?{field}:{}),...(type?{type:type as JobType}:{}),...(search?{title:{contains:search,mode:"insensitive"}}:{})}, include:{poster:{select:{id:true,name:true,company:true}}},, orderBy:{createdAt:"desc"}, take:50 }));
  } catch(e){ next(e); }
});

router.post("/jobs", requireAuth, allowRoles(Role.COMPANY,Role.PROJECT_OWNER,Role.ADMIN), async (req:AuthRequest,res,next)=>{
  try {
    const data=z.object({title:z.string().min(3),description:z.string().min(10),field:z.string(),location:z.string(),type:z.nativeEnum(JobType),experience:z.string().optional(),salary:z.string().optional(),deadline:z.coerce.date().optional()}).parse(req.body);
    res.status(201).json(await prisma.job.create({data:{...data,posterId:req.user!.id}}));
  } catch(e){next(e);}
});

router.post("/jobs/:id/applications", requireAuth, async (req:AuthRequest,res,next)=>{
  try {
    const data=z.object({message:z.string().max(2000).optional()}).parse(req.body);
    const job=await prisma.job.findUnique({where:{id:req.params.id}});
    if(!job || job.status!=="OPEN") return res.status(404).json({error:"Open job not found"});
    const app=await prisma.application.create({data:{jobId:job.id,applicantId:req.user!.id,message:data.message}});
    res.status(201).json(app);
  } catch(e){next(e);}
});

router.get("/jobs/:id/applications", requireAuth, async(req:AuthRequest,res,next)=>{
  try{
    const job=await prisma.job.findUnique({where:{id:req.params.id}});
    if(!job) return res.status(404).json({error:"Job not found"});
    if(job.posterId!==req.user!.id && req.user!.role!==Role.ADMIN) return res.status(403).json({error:"Not authorized"});
    res.json(await prisma.application.findMany({where:{jobId:job.id},include:{applicant:{select:{id:true,name:true,email:true,role:true,location:true}}}}));
  }catch(e){next(e);}
});

router.get("/projects", async (_req,res,next)=>{
  try{res.json(await prisma.project.findMany({where:{status:{not:"CANCELLED"}},include:{owner:{select:{id:true,name:true,location:true,verified:true}}},orderBy:{createdAt:"desc"},take:50}));}catch(e){next(e);}
});

router.post("/projects", requireAuth, allowRoles(Role.COMPANY,Role.PROJECT_OWNER,Role.ENGINEER,Role.ADMIN), async(req:AuthRequest,res,next)=>{
  try{
    const data=z.object({title:z.string().min(3),description:z.string().min(10),type:z.string(),location:z.string(),budget:z.string().optional(),timeline:z.string().optional(),required:z.array(z.string()).default([])}).parse(req.body);
    res.status(201).json(await prisma.project.create({data:{...data,ownerId:req.user!.id}}));
  }catch(e){next(e);}
});

router.get("/materials", async(_req,res,next)=>{
  try{res.json(await prisma.material.findMany({include:{supplier:{select:{id:true,name:true,location:true,verified:true}}},orderBy:{createdAt:"desc"},take:50}));}catch(e){next(e);}
});

router.post("/materials", requireAuth, allowRoles(Role.SUPPLIER,Role.ADMIN), async(req:AuthRequest,res,next)=>{
  try{
    const data=z.object({name:z.string().min(2),category:z.string(),description:z.string().optional(),price:z.string().optional(),offer:z.string().optional()}).parse(req.body);
    res.status(201).json(await prisma.material.create({data:{...data,supplierId:req.user!.id}}));
  }catch(e){next(e);}
});

router.post("/ratings", requireAuth, async(req:AuthRequest,res,next)=>{
  try{
    const data=z.object({targetId:z.string(),score:z.number().int().min(1).max(5),review:z.string().max(2000).optional()}).parse(req.body);
    if(data.targetId===req.user!.id)return res.status(400).json({error:"Cannot rate yourself"});
    res.status(201).json(await prisma.rating.upsert({where:{authorId_targetId:{authorId:req.user!.id,targetId:data.targetId}},update:{score:data.score,review:data.review},create:{...data,authorId:req.user!.id}}));
  }catch(e){next(e);}
});

export default router;