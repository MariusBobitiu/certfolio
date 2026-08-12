<p align="center">
  <img src="public/logo.png" alt="Certfolio logo" width="96" height="96" />
</p>

<h1 align="center">Certfolio</h1>

<p align="center">
  <strong>Your professional identity, built from proof.</strong>
  <br />
  A full-stack platform for bringing credentials, technical skills, and evidence-backed projects together in one trusted public profile.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-000000?logo=nextdotjs" alt="Next.js 16.1" />
  <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/University-Independent_Project-6D28D9" alt="University independent project" />
</p>

![A professional identity assembled from credentials, projects, and technical evidence](public/images/professional-identity-hero.png)

## About the project

Professional achievements are usually scattered across certificate portals,
GitHub repositories, social profiles, and personal websites. Certfolio brings
those fragments into a single structured identity where claims can be supported
by evidence.

The project is designed for students and technical professionals who want to
present what they know and what they have built, as well as recruiters, hiring
managers, and clients who need a clearer way to assess that work.

This repository was developed as an independent university project exploring
how software can make digital professional identity more coherent, portable,
and trustworthy.

## Highlights

| Area             | What Certfolio provides                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credentials      | Issuer-aware records, certificate uploads, verification links, visibility states, and clear separation between verified and self-declared achievements    |
| Projects         | Structured case studies with context, role, tools, outcomes, cover images, and multiple evidence links                                                    |
| Skills           | Categorised, reorderable skills that connect a profile's claims to its wider body of work                                                                 |
| Public profile   | A shareable `/u/[slug]` profile with featured work, contact links, custom accent colours, and public/private controls                                     |
| Dashboard        | At-a-glance profile completeness, portfolio health, evidence coverage, and recommended next steps                                                         |
| Account security | Password hashing, email verification, password recovery, rate limiting, session management, email or TOTP multi-factor authentication, and recovery codes |
| Data controls    | Profile visibility settings, account-data export, and protected account deletion                                                                          |

The interface is responsive, supports light and dark themes, and is built around
an evidence-first design system rather than a conventional link-in-bio layout.

## How it works

```mermaid
flowchart LR
    visitor[Profile owner or visitor] --> app[Next.js application]
    app --> actions[Server Actions and Route Handlers]
    actions --> db[(PostgreSQL)]
    actions --> storage[Cloudflare R2]
    actions --> email[Resend]
    db --> profile[Structured public profile]
    storage --> profile
```

- Next.js App Router renders the public site, authenticated workspace, and
  public profiles.
- Server Actions validate mutations with Zod and keep sensitive operations on
  the server.
- Drizzle ORM stores users, sessions, preferences, credentials, issuers,
  projects, evidence links, and skills in PostgreSQL.
- Cloudflare R2 stores profile images, project covers, and certificate files.
- Resend delivers verification, password-reset, and email MFA messages.

## Technology

- **Application:** Next.js 16, React 19, TypeScript
- **Interface:** Tailwind CSS 4, shadcn/ui, Base UI, Lucide icons
- **Database:** PostgreSQL, Drizzle ORM, Drizzle Kit
- **Validation and forms:** Zod, React Hook Form, next-safe-action
- **Authentication:** Server-managed sessions, Argon2id, email and TOTP MFA
- **Storage and email:** Cloudflare R2, AWS S3 SDK, Resend
- **Tooling:** pnpm, ESLint, Prettier, Turbopack

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or newer
- [pnpm](https://pnpm.io/) 10.x
- A PostgreSQL database
- A Cloudflare R2 bucket and API credentials
- A Resend API key and verified sending domain for email flows

### 1. Clone and install

```bash
git clone https://github.com/MariusBobitiu/certfolio.git
cd certfolio
pnpm install
```

### 2. Configure the environment

Create `.env.local` in the project root:

```dotenv
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/certfolio
# For private-network databases without TLS, such as Dokploy's internal service:
# DATABASE_SSL_MODE=disable

# Generate with: openssl rand -base64 32
MFA_TOTP_ENCRYPTION_KEY=replace-with-a-base64-encoded-32-byte-key

# Generate separately with: openssl rand -base64 32
# Keep this stable across builds and all running app instances.
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=replace-with-a-base64-encoded-32-byte-key

# Transactional email
RESEND_API_KEY=re_replace_me
RESEND_EMAIL_FROM_DOMAIN=example.com
# Alternatively, set a complete sender:
# EMAIL_FROM=Certfolio <hello@example.com>

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=replace_me
CLOUDFLARE_R2_SECRET_ACCESS_KEY=replace_me
CLOUDFLARE_R2_BUCKET_NAME=certfolio-assets
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Optional: migrations and demo data run automatically on startup by default
SEED_ON_STARTUP=true
```

Do not commit `.env.local` or any real credentials. The file is already covered
by the repository's `.gitignore` rules.

### 3. Prepare the database

Apply the checked-in migrations and seed the local demo data:

```bash
pnpm db:migrate
pnpm db:seed
```

The seed can be customised with `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`,
`DEMO_ADMIN_NAME`, and `DEMO_ADMIN_SLUG`. Without overrides, the local demo
account is `admin@demo.com` with password `test1234`.

### 4. Run the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The seeded public profile
is available at [http://localhost:3000/u/admin](http://localhost:3000/u/admin).

> **Note:** database migrations and seeding also run when the application starts.
> Set `SEED_ON_STARTUP=false` when you want to manage that process explicitly.

## Running with Docker

Build the production image:

```bash
docker build \
  --build-arg NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" \
  -t certfolio .
```

`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` must be supplied to the Docker build as
well as to the running container. Next.js embeds it in the build output so
Server Action identifiers remain consistent across builds and replicas. In a
deployment platform, configure the same value as both a build argument and a
runtime environment variable. Generate it once with `openssl rand -base64 32`;
changing it invalidates Server Actions referenced by already-open pages.

Run it with the same environment configuration used for local development:

```bash
docker run --rm \
  --name certfolio \
  --publish 3000:3000 \
  --env-file .env.local \
  --env SEED_ON_STARTUP=false \
  certfolio
```

The database address in `DATABASE_URL` must be reachable from inside the
container; `localhost` refers to the container itself. Use the hostname of your
database service, or `host.docker.internal` when connecting to a database on a
supported host system. Set `DATABASE_SSL_MODE=disable` for an internal database
that does not offer TLS; externally hosted databases default to requiring TLS.

The image runs Next.js' minimal standalone server as a non-root user and
includes a health check. Migrations run at container startup. Demo seeding is
disabled in the image by default; pass `--env SEED_ON_STARTUP=true` when you
explicitly want the sample portfolio data.

## Available commands

| Command            | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `pnpm dev`         | Start the Turbopack development server          |
| `pnpm build`       | Create a production build                       |
| `pnpm start`       | Run the production build                        |
| `pnpm lint`        | Run ESLint                                      |
| `pnpm typecheck`   | Check TypeScript without emitting files         |
| `pnpm format`      | Format TypeScript and TSX files with Prettier   |
| `pnpm db:generate` | Generate a migration from schema changes        |
| `pnpm db:migrate`  | Apply pending database migrations               |
| `pnpm db:seed`     | Seed issuers, demo users, and portfolio content |

## Project structure

```text
certfolio/
├── drizzle/                  # SQL migrations and Drizzle metadata
├── public/                   # Brand assets, imagery, and social icons
└── src/
    ├── app/                  # Routes, layouts, Server Actions, and API handlers
    │   ├── (auth)/           # Sign-in, registration, recovery, and MFA
    │   ├── (main)/           # Authenticated portfolio workspace
    │   ├── (information)/    # Contact, privacy, and terms pages
    │   ├── api/              # Upload and sign-out endpoints
    │   └── u/[slug]/         # Public profiles and project case studies
    ├── components/           # Product, landing-page, and UI components
    ├── data/                 # Server-side queries and view-model assembly
    └── lib/                  # Auth, database, storage, validation, and utilities
```

## Quality checks

Before submitting a change, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Project status

Certfolio is an actively developed academic prototype. It demonstrates a
complete end-to-end product workflow, but it should receive a dedicated
security, accessibility, and operational review before being treated as a
production service.

---

<div align="center">
  Built by <a href="https://mariusbobitiu.dev">Marius Bobitiu</a>
</div>
