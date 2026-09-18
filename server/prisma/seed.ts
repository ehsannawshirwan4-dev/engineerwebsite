import { PrismaClient, Role, JobType } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main(){
  await prisma.message.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.application.deleteMany();
  await prisma.material.deleteMany();
  await prisma.project.deleteMany();
  await prisma.job.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.portfolioProject.deleteMany();
  await prisma.engineerProfile.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash=await bcrypt.hash("DemoPassword123!",12);

  const aram=await prisma.user.create({data:{name:"Aram Ahmed",email:"aram@engineer.local",passwordHash,role:Role.ENGINEER,location:"Sulaymaniyah",availability:"AVAILABLE",verified:true,bio:"Civil engineer focused on structural design and site management.",engineer:{create:{discipline:"Civil Engineering",experience:6,skills:["Structural Design","AutoCAD","Site Management"],university:"University of Garmian",certificates:{create:{title:"Civil Engineering Certificate",issuer:"University of Garmian",verified:true}},projects:{create:{title:"Residential Structural Project",description:"Sample portfolio project"}}}}}});
  const sara=await prisma.user.create({data:{name:"Sara Mahmood",email:"sara@engineer.local",passwordHash,role:Role.ENGINEER,location:"Erbil",availability:"AVAILABLE",verified:true,engineer:{create:{discipline:"Architectural Engineering",experience:4,skills:["Revit","3D Design","BIM"]}}}});
  const company=await prisma.user.create({data:{name:"Kurd Build Co.",email:"company@engineer.local",passwordHash,role:Role.COMPANY,location:"Sulaymaniyah",verified:true,company:{create:{industry:"Construction",description:"Demo construction company"}}}});
  const supplier=await prisma.user.create({data:{name:"Garmian Steel Factory",email:"supplier@engineer.local",passwordHash,role:Role.SUPPLIER,location:"Garmian",verified:true}});
  const student=await prisma.user.create({data:{name:"Darya Salim",email:"student@engineer.local",passwordHash,role:Role.STUDENT,location:"Kalar",student:{create:{university:"University of Garmian",discipline:"Civil Engineering",skills:["AutoCAD","Surveying"]}}}});
  await prisma.user.create({data:{name:"Karwan Salih",email:"worker@engineer.local",passwordHash,role:Role.FOREMAN,location:"Sulaymaniyah",availability:"AVAILABLE",verified:true,worker:{create:{profession:"Foreman",experience:12,skills:["Site supervision","Masonry"],workPhotos:[]}}}});

  await prisma.job.create({data:{title:"Civil Site Engineer",description:"Demo job for a civil site engineer.",field:"Civil Engineering",location:"Sulaymaniyah",type:JobType.FULL_TIME,experience:"2+ years",posterId:company.id}});
  await prisma.job.create({data:{title:"Engineering Intern",description:"Practical training opportunity for engineering students.",field:"Civil Engineering",location:"Kalar",type:JobType.INTERNSHIP,experience:"Student",posterId:company.id}});
  await prisma.project.create({data:{title:"Modern Residential Complex",description:"Demo residential project requiring engineering professionals.",type:"Residential",location:"Sulaymaniyah",budget:"$420K",timeline:"12 months",required:["Civil Engineering","Architectural Engineering"],ownerId:company.id}});
  await prisma.material.create({data:{name:"Structural Steel",category:"Steel",price:"Contact",offer:"Bulk discount",supplierId:supplier.id}});
  await prisma.rating.create({data:{authorId:company.id,targetId:aram.id,score:5,review:"Demo rating"}});

  console.log("Seed complete.");
  console.log("Demo login: aram@engineer.local / DemoPassword123!");
  console.log("Student: student@engineer.local / DemoPassword123!");
}
main().finally(()=>prisma.$disconnect());