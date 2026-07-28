# Read Journey — Backend

Backend for **Read Journey** — a reading-progress tracker app. Built from scratch with Express, TypeScript, and Prisma/PostgreSQL.

> Read Journey is not a reader or an audiobook player. The user reads a physical (or any other) book on their own; the app just logs page numbers, time, and builds progress stats.

## Tech stack

- **Express 5** + **TypeScript**
- **PostgreSQL** via **Prisma ORM** (Docker)
- **Zod** — input validation
- **JWT** (`jsonwebtoken`) + **httpOnly cookies** — authentication
- **bcrypt** — password hashing
- **axios** — proxying the Open Library API
- **pino** / **pino-http** — structured logging
- **Playwright** — API tests (no browser, via the `request` fixture)
- **helmet**, **cors**, **cookie-parser** — baseline HTTP security

## Architecture

Each resource is split into layers:

```
validations/*.ts   → Zod schemas
services/*/*.ts    → business logic, Prisma queries
controllers/*.ts   → request handlers
routes/*.ts        → URL + method mapping → middlewares → controller
```

### Resources

| Resource  | Description                                                    |
| --------- | -------------------------------------------------------------- |
| `auth`    | Register, login, logout, session refresh, current user         |
| `books`   | Open Library proxy — recommended books, search by title/author |
| `library` | User's personal library — add/view/remove books                |
| `reading` | Reading tracking — start/stop sessions, stats, diary           |

## Auth: access + refresh tokens

- **Access token** — JWT, 15 minutes, payload `{ userId }`, returned in the response body. Sent via the `Authorization: Bearer <token>` header.
- **Refresh token** — a random string (`crypto.randomBytes`), 7 days, stored in the `Session` table, sent as an **httpOnly cookie**.

**Token rotation:** every `/auth/refresh` call deletes the old refresh record and creates a new one.

**Multiple concurrent sessions** — logging in on a new device doesn't kill other sessions (each login creates a new `Session` row; `logout` removes only one, matched by its specific refresh token).

## Prisma schema

```
User            — id, name, email, password (hash)
Session         — refreshToken (unique), userId, expiresAt
LibraryBook     — userId, title, author, coverUrl?, totalPages, currentPage, status (enum), openLibraryId? (unique per user)
ReadingSession  — libraryBookId, startPage, endPage?, startedAt, finishedAt?
```

`ReadingStatus` enum: `UNREAD → READING → FINISHED`. Status only moves forward — pausing a reading session doesn't roll `READING` back to `UNREAD`.

## API

All endpoints except register/login require an `Authorization: Bearer <accessToken>` header.

### Auth

| Method | Path             | Description                            |
| ------ | ---------------- | -------------------------------------- |
| POST   | `/auth/register` | Register + automatic sign-in           |
| POST   | `/auth/login`    | Sign in                                |
| POST   | `/auth/logout`   | Sign out (removes the current session) |
| POST   | `/auth/refresh`  | Refresh the token pair (rotation)      |
| GET    | `/auth/me`       | Current user data from the token       |

### Books (Open Library proxy)

| Method | Path                                 | Description                                                                                               |
| ------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| GET    | `/books?page=&limit=&title=&author=` | Recommended books. No filters — fixed genre (`/subjects`); with `title`/`author` — search (`search.json`) |

### Library

| Method | Path               | Description                                           |
| ------ | ------------------ | ----------------------------------------------------- |
| POST   | `/library`         | Add a book manually (`title`, `author`, `totalPages`) |
| GET    | `/library?status=` | List the user's books, optional status filter         |
| DELETE | `/library/:id`     | Remove a book from the library                        |

### Reading

| Method | Path                               | Description                                                          |
| ------ | ---------------------------------- | -------------------------------------------------------------------- |
| POST   | `/reading/:id/start`               | Start a reading session (`startPage` = book's current page)          |
| POST   | `/reading/:id/stop`                | End a session (`endPage` in the body), updates progress and status   |
| GET    | `/reading/:id/stats`               | All reading sessions for a book, in order (for the diary/stats view) |
| DELETE | `/reading/:id/sessions/:sessionId` | Remove a single reading-diary entry                                  |

Every `library`/`reading` operation checks that the record belongs to the authenticated user (`userId` and `id` together in the `where` clause) — attempts to affect another user's record are silently no-ops (`deleteMany` returns `{ count: 0 }`) rather than errors.

## Error handling and logging

A centralized error handler distinguishes two kinds of errors:

- **Expected** (`createHttpError`, e.g. "Email in use") — their own status and message go to the client, nothing is logged (this is normal app behavior)
- **Unexpected** (a bug, a Prisma failure) — the client gets a plain `500 Internal server error` with no details (paths, DB structure, etc.), while the full stack trace is logged via `pino`

`pino-http` logs each request as a single line (`METHOD /path status - Nms`), with `authorization`/`cookie` headers redacted so tokens never end up in the logs.

## Validation

Every resource has Zod schemas for `body`, `query`, and `params`. Because Express 5 turned `req.query` into a read-only getter, validated results aren't written back into `req.body`/`req.query`/`req.params` — they go into separate `req.validatedBody` / `req.validatedQuery` / `req.validatedParams` fields, applied consistently across all three sources.

## Setup

```bash
git clone <repo>
cd read-journey-backend
npm install
```

`.env`:

```dotenv
PORT=3000
NODE_ENV=development

POSTGRES_USER=user
POSTGRES_PASSWORD=<dev password, no special characters>
POSTGRES_DB=read_journey

DATABASE_URL="postgresql://user:<password>@localhost:5432/read_journey?schema=public"

JWT_SECRET=<long random string>
OPENLIB_API_URL="https://openlibrary.org"
```

Start the database and apply the schema:

```bash
docker compose up -d
npx prisma migrate dev
```

Run:

```bash
npm run dev
```

## Tests

```bash
npx playwright test
```

Covers the full `auth` flow (register, login, logout with idempotency, refresh-token rotation) and `library`/`reading` (adding, filtering, ownership-checked deletion, start/stop reading, status transitions, stats).

## Deployment

Deployed as a Docker container on **Render** — a PostgreSQL instance and a Web Service, both created directly in the Render dashboard (Web Service must be created with Docker explicitly selected as the runtime, not the auto-detected Node.js option, otherwise Render ignores the `Dockerfile` and falls back to its own build/start commands).

`Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .
RUN npm install

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

The whole project is copied in **before** `npm install`, since `postinstall` runs `prisma generate`, which needs `prisma/schema.prisma` to already be present in the image.

Migrations run as part of the container's start command (`prisma migrate deploy && npm start`) rather than as a separate pre-deploy step, since that's a paid-tier feature on Render.

Environment variables are set directly in the Render dashboard (not from `.env`, which is excluded via `.dockerignore`): `DATABASE_URL` (Render's Internal Database URL for the Postgres instance), `JWT_SECRET`, `NODE_ENV=production`, `OPENLIB_API_URL`, `FRONTEND_DOMAIN`.

The domain (`viach.dev`, managed on Cloudflare) points `api.readjourney.viach.dev` at the Render service via a `CNAME` record — frontend and backend as subdomains of the same registrable domain keeps auth cookies same-site (`SameSite=Lax`), avoiding cross-site cookie complications.
