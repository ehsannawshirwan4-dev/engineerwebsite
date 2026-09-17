# Engineer Platform — Full-Stack Foundation

University of Garmian · College of Engineering · Civil Engineering Department
Academic Year 2026–2027
Developers: Ehsan Nawshirwan & Muhammad Khalid

This package is the backend/database foundation for the Engineer Platform.

## Architecture

- Node.js + Express + TypeScript API
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Role-based authorization
- REST API routes for users, jobs, projects, engineers/workers, companies and materials
- Seed data for development

## Requirements

- Node.js 20+
- Docker Desktop (recommended for PostgreSQL)

## Setup

1. Start PostgreSQL:

   docker compose up -d

2. Install dependencies:

   npm install

3. Create the environment file:

   Copy `server/.env.example` to `server/.env`

4. Generate Prisma client:

   npm run db:generate

5. Create the database schema:

   npm run db:migrate

6. Seed demo data:

   npm run db:seed

7. Start the API:

   npm run dev

API: http://localhost:4000
Health check: http://localhost:4000/api/health

## Main API

POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
GET  /api/engineers
GET  /api/workers
GET  /api/companies
GET  /api/jobs
POST /api/jobs
GET  /api/projects
POST /api/projects
GET  /api/materials
POST /api/materials
POST /api/jobs/:id/applications
GET  /api/jobs/:id/applications
POST /api/ratings

Protected endpoints require:

Authorization: Bearer <JWT>

## Notes

This foundation intentionally does not claim that payment/refund/legal protection is implemented. The supplied project document describes those as goals/features, while this package establishes the technical foundation needed to implement them safely in later stages.

## My Profile / CV (new)
Every registered user can create a CV-style public profile from `client/index.html` (or the future React UI). The profile supports:
- professional title, headline and summary
- education and experience entries (JSON arrays for now)
- skills, languages, interests and achievements
- phone, location, avatar and CV URL
- public/private visibility
- unique shareable profile slug

API:
- `GET /api/profile/me` — authenticated user's full profile
- `PUT /api/profile/me` — create/update the CV profile
- `GET /api/profile/:slug` — public shareable profile when visibility is PUBLIC

The profile is role-independent, so engineers, students, companies, project owners, suppliers, craftsmen, foremen, laborers and job seekers can all have a shareable profile.
