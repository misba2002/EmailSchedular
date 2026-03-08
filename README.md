# 📧 Email Scheduler System

A full-stack **Email Scheduling Platform**  
This system allows users to schedule emails for future delivery, apply delays and hourly limits, and reliably send emails even after server restarts.

---

## 🔗 Live Demo

- **Frontend (Vercel):**  
  👉 https://email-schedular-ten.vercel.app/

- **Backend API & Worker (Render):**  
  👉 https://emailschedular-ozrn.onrender.com

---

**👉 Demo Link:(vedio-link)[https://drive.google.com/file/d/18vHcjcrilG5RpgFq_cwl1jfgCFcDJdog/view?usp=drivesdk]

## 🚀 Project Overview

This application enables users to:
- Compose and schedule emails
- Control delivery using delays and hourly rate limits
- Track email status (`scheduled`, `sent`, `failed`)
- Ensure persistence across server restarts
- Send emails reliably using a background worker

The system is designed with **real-world backend architecture**, using queues, workers, and persistent storage.

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React Icons
- React DatePicker
- PapaParse (CSV uploads)

### Backend
- Node.js
- Express
- TypeScript
- BullMQ
- Zod (schema validation)
- SendGrid (SMTP email service)

### Database & Queue
- PostgreSQL (Render)
- Redis (BullMQ)

### Authentication
- Google OAuth (NextAuth.js)

### Infrastructure
- Backend: Render
- Frontend: Vercel
- Database: Render PostgreSQL
- Queue: Redis

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

#### Environment Variables (`.env`)
```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# PostgreSQL
PG_USER=your_pg_user
PG_PASSWORD=your_pg_password
PG_DATABASE=your_pg_db
PG_HOST=localhost
PG_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your_jwt_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email



# Worker
WORKER_CONCURRENCY=3

⚠️ Note: Ethereal SMTP was initially used locally but replaced with SendGrid due to SMTP restrictions on Render’s free tier.

Start Services

Ensure PostgreSQL and Redis are running.

npm install
npm run dev

Start Worker
npm run worker


Health check:

backend-url /=>

{
status:success
}

2️⃣ Frontend Setup
Environment Variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret

Run Frontend
npm install
npm run dev


Runs at:

http://localhost:3000

 **🏗 Architecture Overview** 
Frontend (Next.js)
        ↓
Backend API (Express)
        ↓
PostgreSQL (Email metadata & status)
        ↓
BullMQ Queue
        ↓
Redis (Queue + Rate Limits)
        ↓
Worker (Node.js)
        ↓
SendGrid SMTP

**⏱ How Scheduling Works**

-User schedules an email from the frontend

-Email metadata is stored in PostgreSQL

-A BullMQ job is created with a delay (if any)

-Worker picks the job at scheduled time

-Email is sent via SendGrid

-Email status is updated in the database

-Supports immediate and future delivery.

**🔄 Persistence on Restart**

-PostgreSQL stores all email records

-Redis + BullMQ store pending jobs

-If the server restarts:

--Worker reconnects to Redis

--Pending jobs resume automatically

--Future emails still send correctly
**
🚦 Rate Limiting & Concurrency**
-Hourly Rate Limiting

-Redis tracks sent emails per hour

-Prevents exceeding configured hourly limits

**Delay & Concurrency**

-BullMQ worker enforces delay between jobs

-WORKER_CONCURRENCY controls parallel email sending

-Prevents SMTP overload and throttling

📌 Features Implemented
| Feature                  | Backend   | Frontend  |
| ------------------------ |---------- | --------- |
| Email scheduling         | ✅       | ✅        |
| Multiple recipients      | ✅       | ✅        |
| Delay between emails     | ✅       | ✅        |
| Hourly limit enforcement | ✅       | ✅        |
| Retry & failure handling | ✅       | ❌        |
| Compose UI               | ❌       | ✅        |
| Inbox (Scheduled & Sent) | ❌       | ✅        |
| Email details view       | ❌       | ✅        |
| Google OAuth login       | ❌       | ✅        |
| CSV/TXT upload           | ❌       | ✅        |




**⚡ Assumptions, Shortcuts & Trade-offs**

1.SendGrid used instead of Ethereal due to Render SMTP restrictions


2.Retry attempts are fixed in BullMQ

3.Hourly limit is global (not per user)

4.Single worker instance used for simplicity

5.Frontend validation kept minimal; backend validation enforced using Zod

✅ Conclusion

1.This project demonstrates:

2.Background job processing with BullMQ

3.Reliable scheduling with persistence

4.Rate limiting and concurrency control

5.Real-world backend architecture patterns

6.Built with scalability and reliability in mind while keeping the implementation clear and maintainable.
