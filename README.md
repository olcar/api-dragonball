# Dragon Ball API

REST API for Dragon Ball characters, planets, and transformations built with NestJS.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** NestJS 10 + Express
- **Database:** MySQL 8.0 via TypeORM
- **Auth:** JWT (bcryptjs)
- **Image Upload:** Cloudinary
- **Docs:** Swagger (`/api-docs`)
- **Testing:** Jest (28 unit tests, 4 e2e)

## Setup

```bash
# 1. Copy env vars and fill them in
cp .env.example .env

# 2. Install
npm install

# 3. Start MySQL and create the database
mysql -u root -e "CREATE DATABASE dragonball_api;"

# 4. (optional) Import seed data
mysql -u root dragonball_api < "Dump 04112023last.sql"

# 5. Run
npm run start:dev
```

## API

Global prefix: `/api` — Docs at `/api-docs`

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/characters` | List characters (paginated, filterable) |
| GET | `/api/characters/:id` | Get character with planet + transformations |
| GET | `/api/planets` | List planets (paginated, filterable) |
| GET | `/api/planets/:id` | Get planet with characters |
| GET | `/api/transformations` | List transformations |
| GET | `/api/transformations/:id` | Get transformation with character |

### Auth Endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/api/auth/register` | `{name, email, password}` | User (no password hash) |
| POST | `/api/auth/login` | `{email, password}` | `{access_token, user}` |

### Protected Endpoints (require `Authorization: Bearer <token>`)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/characters` | admin | Create character |
| PATCH | `/api/characters/:id` | admin | Update character |
| DELETE | `/api/characters/:id` | admin | Delete character |
| POST | `/api/planets` | admin | Create planet |
| PATCH | `/api/planets/:id` | admin | Update planet |
| DELETE | `/api/planets/:id` | admin | Delete planet |
| POST | `/api/transformations` | admin | Create transformation |
| PATCH | `/api/transformations/:id` | admin | Update transformation |
| DELETE | `/api/transformations/:id` | admin | Delete transformation |
| GET | `/api/users` | admin | List users |
| GET | `/api/users/:id` | admin | Get user |
| PATCH | `/api/users/:id/role` | admin | Change user role |
| DELETE | `/api/users/:id` | admin | Delete user |

### Admin Setup

Register a user via `POST /api/auth/register`, then promote them to admin:

```bash
npm run seed:admin -- user@example.com
```

Users created via register get `role: user` by default.
Node.js 20 is recommended. Node 26+ requires a patch to `buffer-equal-constant-time` (see `node_modules/`).
