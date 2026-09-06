# Attendify

College attendance for **admin**, **class teachers** (advisors), and **subject teachers**. Built as a Next.js PWA so it installs on a phone and still works on a laptop. It deploys on **Vercel’s free hobby plan**. The database is **Neon’s free Postgres** in production and Docker Postgres on your machine.

## Why this stack (cost)

Django and FastAPI need a always-on server. Vercel/Netlify free tiers are for Node/serverless. SMS OTP also costs money per message, so **email OTP** is the verification channel. Phone numbers can be stored later; they are not used for SMS.

## Roles

| Role | What they do |
| --- | --- |
| Admin | Classes, subjects, student rolls, assign subject teachers, assign class teacher |
| Subject teacher | Mark hour-wise attendance (Present / Absent / Late / On duty) |
| Class teacher | See every subject’s attendance % for their class; below 75% is flagged |

The first self-registered user becomes admin if none exists. Demo seed already creates one.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

Demo logins (password `Attendify@123`):

- `admin@college.edu` — admin
- `advisor@college.edu` — class teacher of CSE 2024 A
- `lecturer@college.edu` — CS301 subject teacher

Without `RESEND_API_KEY`, the 6-digit code is printed in the terminal and shown on the verify page in development.

## Free production deploy

1. Create a [Neon](https://neon.tech) project (free) and copy the pooled connection string.
2. Push this repo to GitHub, import it on [Vercel](https://vercel.com).
3. Set environment variables: `DATABASE_URL`, `SESSION_SECRET` (32+ chars), `APP_URL` (your Vercel URL). Optional: `RESEND_API_KEY` and `EMAIL_FROM` from [Resend](https://resend.com) (100 emails/day free).
4. In Vercel build, `prisma generate` already runs. After first deploy, from your machine:

```bash
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" npm run db:seed
```

5. On a phone: open the site → browser menu → **Add to Home Screen**.

## College notes we implemented

- Hour 1–8 (typical timetable slot), not only a daily tick
- **OD (on duty)** for university duty / sports / placement
- Class-teacher matrix across all papers, 75% shortfall highlight
- Bulk student import (`roll, name`)

## Left out on purpose (add when you need them)

- Student login and shortage SMS
- Timetable lock so a teacher can only mark their hour
- University Excel export
- Department / multiple campuses
- Biometric or QR geofence (needs devices and still fails in poor network halls)
