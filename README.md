# Education CRM — Next.js 15 + MongoDB Scaffold

Production-ready foundation for an enterprise Education CRM SaaS. Paste these files into a fresh Next.js 15 App Router project.

## Quick Start

```bash
npx create-next-app@latest edu-crm --typescript --tailwind --app --eslint
cd edu-crm
# Copy contents of this scaffold into the project root, merging folders.

bun add mongoose bcryptjs jsonwebtoken zod next-auth @auth/mongodb-adapter \
  socket.io socket.io-client firebase firebase-admin cloudinary \
  recharts framer-motion lucide-react date-fns \
  @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers \
  class-variance-authority clsx tailwind-merge \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select \
  @radix-ui/react-tabs @radix-ui/react-avatar @radix-ui/react-toast \
  @radix-ui/react-label @radix-ui/react-slot
bun add -D @types/bcryptjs @types/jsonwebtoken

npx shadcn@latest init
npx shadcn@latest add button card input label table dialog dropdown-menu \
  select tabs avatar badge toast sheet form textarea
```

Copy `.env.example` → `.env.local` and fill values.

## Architecture

- **Framework**: Next.js 15 App Router (single full-stack app)
- **DB**: MongoDB via Mongoose
- **Auth**: JWT + httpOnly cookies, role middleware, RBAC matrix
- **Realtime**: Socket.IO via custom server (`server.ts`)
- **Storage**: Cloudinary
- **Notifications**: Firebase Cloud Messaging
- **UI**: Tailwind + Shadcn + Framer Motion + Recharts

## Folder Map

```
app/
  (auth)/         login, register, forgot-password
  (dashboard)/    dashboard, leads, pipeline, universities, courses,
                  followups, employees, analytics, settings
  api/            auth, leads, universities, courses, followups, users,
                  uploads, notifications, socket
components/       ui (shadcn), layout, leads, pipeline, dashboard, charts, forms
lib/              db, auth, jwt, cloudinary, firebase, socket, rbac, validators
models/           Mongoose schemas (User, Lead, University, Course, ...)
actions/          Server Actions
hooks/            React hooks (useAuth, useSocket, useLeads, ...)
services/         External integrations (Twilio, WhatsApp, Email)
types/            Shared TS types
utils/            Helpers
config/           Constants, role matrix
middleware.ts     Route protection by role
```

## Roles (Hierarchy)

`super_admin > admin > general_manager > senior_manager > manager > junior_manager > team_leader > counselor`

See `config/rbac.ts` for permission matrix.

## What's Included

- Mongoose models for all 11 collections
- Auth scaffold (JWT login/register, refresh, middleware)
- RBAC permission matrix + route guard middleware
- Lead CRUD API routes + Server Actions
- Socket.IO setup (custom server)
- Cloudinary upload helper
- FCM helper
- Validation schemas (Zod)
- Shadcn-ready UI structure
- Dashboard layout shell
- Sample dashboard page

## What to Extend

Calling (Twilio/Exotel), WhatsApp Business API, AI lead scoring, charts pages, kanban DnD, CSV import, audit logs — stubs are noted in `services/` and `actions/` with TODOs.

## Deployment

- Vercel (serverless): comment out `server.ts` Socket.IO; use Pusher/Ably or Vercel-compatible realtime instead.
- Custom Node host (Railway/Render/Fly): use the provided `server.ts` for full Socket.IO support.
