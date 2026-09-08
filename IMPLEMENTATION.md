# Ceylon marketplace implementation

## Existing architecture

The repository is a clean Next.js 16.3.4 / React 19 / TypeScript App Router starter. There are no existing business models, authentication, persistence, routes, or design components to preserve. The installed Next.js guides are the framework reference.

## Implementation order

1. Establish the design system, responsive public shell, curated preview collection and marketplace homepage.
2. Build typed MongoDB collections, indexed queries, input validation, opaque sessions and role checks.
3. Implement browsing, category/location pages, readable listing URLs and listing details.
4. Add registration, email/password login, Google identity verification and guest verification.
5. Build listing submission, image management, moderation, audit history and owner availability updates.
6. Build user and administrator workspaces backed by the API.
7. Add metadata, JSON-LD, sitemap/robots, editorial/policy pages and explicit preview noindex protection.
8. Validate lint, production build, database integration, moderation isolation and responsive browser flows.

## Data design

- users: unique normalized email, scrypt password hash or Google subject, name, role, verification, timestamps.
- sessions: SHA-256 token digest, user ID, TTL expiration; only opaque token in HttpOnly cookie.
- listings: unique human-readable slug, owner/contact, purpose/category, province/district/city, price/unit, facilities, photos, availability/date blocks, moderation status, verification, SEO controls, embedded audit history.
- images: opaque ID, compressed WebP bytes, ownership/upload token; access through controlled API.
- inquiries, reports, favorites, notifications, verificationTokens, rateLimits, siteSettings: scoped records with compound/TTL indexes.
- categories and location hierarchy: shared validated catalogs; no generated empty SEO permutations.

## Routes

Public: `/`, `/explore`, `/places/[slug]`, `/category/[slug]`, `/city/[slug]`, `/[collection]/[city]`, `/guides`, `/guides/[slug]`, `/about`, `/contact`, `/policies/[slug]`.
Account: `/login`, `/register`, `/submit`, `/verify`, `/dashboard`, `/admin` (private pages noindex).
API: `/api/[...path]` for authentication, listings, moderation, uploads, inquiries, reports, favorites and settings.

## Deployment boundary

Production requires MongoDB, a canonical site URL, email delivery credentials and Google credentials to enable those providers. Preview content is explicitly illustrative, cannot receive genuine inquiries and is excluded from indexing. Local image storage uses MongoDB binary documents with strict limits; a CDN/object-storage adapter is a scale-up requirement. External approvals, real property verification, legal/operator details, analytics consent configuration, backups, monitoring and load testing are launch tasks, not implied by a successful build.
