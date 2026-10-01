# Shortly

A full-stack URL shortener built with Next.js, TypeScript, PostgreSQL and Prisma.

Shortly allows users to create short, memorable links, customize aliases, set expiration dates, track clicks and view link analytics from a personal dashboard.

## Features

- Shorten long URLs
- Generate unique short codes
- Create custom URL aliases
- Validate submitted URLs
- Expiring short links
- User registration and login
- Secure password hashing with bcrypt
- Database-backed authentication sessions
- Protected user dashboard
- User-owned URL management
- Delete shortened links
- Click tracking
- Browser and referrer analytics
- Clicks-over-time visualization
- Per-link analytics
- QR code generation and download
- Responsive interface
- PostgreSQL database with Prisma ORM

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- QRCode React

### Backend

- Next.js API Routes
- Node.js
- Prisma ORM
- PostgreSQL
- bcryptjs

### Authentication

- HTTP-only session cookies
- Database-backed sessions
- bcrypt password hashing

## Project Structure

```text
shortly/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── [shortCode]/
│   │   │   └── route.ts
│   │   ├── analytics/
│   │   ├── api/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   └── urls/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx
│   └── lib/
│       ├── auth.ts
│       └── prisma.ts
├── prisma7.config.ts
├── package.json
└── README.md
```
