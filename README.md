# Ceylon · Find your kind of somewhere

A working Next.js 16 / React 19 / TypeScript / MongoDB marketplace for Sri Lankan homes, stays and day-out places. Includes a responsive public website, user workspace and role-protected administration API.

## Run locally

```bash
bun install
cp .env.example .env.local
bun run db:dev
```

Keep the database terminal running. In another terminal:

```bash
bun run dev
```

Open **http://localhost:3000**. The local database binds only to `127.0.0.1:27019`, persists in `.data/mongodb`, creates indexes and adds eight clearly marked sample properties. Its first start downloads a MongoDB binary. Do not expose this unauthenticated development database to a network.

The workspace already has a local `.env.local` created for this setup; it is gitignored and contains no production credentials. Sample property photos and prices are illustrative. Samples cannot receive inquiries and never enter listing sitemaps.

## Try the actual workflow

1. Register at `/register`. In local development without an email provider, the success screen exposes the verification link **only to the submitting browser**.
2. Open that link and select **Verify my email**.
3. Visit `/submit`, complete the three steps and upload your own photo (JPEG, PNG or WebP, at least 600 × 400, maximum 8 MB).
4. The listing is pending. It does not appear in public search, details or sitemaps.
5. Promote your registered operator account from a trusted terminal:

   ```bash
   bun run db:admin -- your-email@example.com
   ```

6. Open `/admin`, enter the review queue, inspect the submission and approve it. A contact email must be verified first.
7. The approved listing becomes public. Other visitors can save it, submit an inquiry or report it. Inquiries and moderation notifications appear in the owner’s dashboard.
8. Update availability from `/dashboard?tab=availability`. Changing a title, description or price returns the listing to review.

There are no built-in admin passwords and users cannot choose their own role. Anonymous dashboard pages are explicitly labeled previews. Every private data endpoint independently checks its session and role.

## Screens

| Route                                                   | Purpose                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/`                                                     | Search, category filters, sample/approved places, destinations and host introduction                    |
| `/explore`                                              | Server-rendered search with price, category, purpose, city, facilities, guests and availability filters |
| `/places/[readable-slug]`                               | Gallery, details, facilities, inquiry, share, save and report                                           |
| `/city/[slug]`, `/category/[slug]`                      | Useful discovery pages with quality-based indexing                                                      |
| `/villas-for-rent/galle` and other catalog combinations | Category/location discovery without arbitrary filter indexing                                           |
| `/submit`                                               | Three-step guest/account submission with tab-local draft saving                                         |
| `/login`, `/register`, `/verify`                        | Email/password authentication, optional Google Identity Services and verification                       |
| `/dashboard`                                            | Overview, listings, saved places, inquiries, availability, profile and notifications                    |
| `/admin`                                                | Overview, review queue, listings, members, reports, messages, SEO, catalog, activity and settings       |
| `/guides`, `/about`, `/contact`, `/policies/[slug]`     | Original editorial content and policy architecture                                                      |
| `/sitemap.xml`, `/sitemaps/*.xml`, `/robots.txt`        | Indexability-gated sitemap index and child sitemaps                                                     |

## Boarding, SEO and Auto ads

Boarding listings support women, men and couples, private/shared rooms, custom capacity and vacancies, and monthly pricing per person or room. Owners manage these through their dashboard; substantive changes return to admin review. Public boarding pages and original guides have canonical metadata and inventory-based indexing rules.

Google AdSense Auto ads integration is prepared and disabled by default. See [setup, page exclusions and privacy requirements](docs/SEO-BOARDING-ADS.md) before supplying a publisher ID or enabling serving.

## MongoDB and deployment

Use a supported, authenticated MongoDB deployment with network access restricted to the application. Configure `.env.local` or deployment secrets using `.env.example`, then run:

```bash
bun run db:setup
bun run lint
bun run typecheck
bun run build
bun run start
```

`db:setup` creates unique, compound, text and TTL indexes. Run it before accepting writes. Never point the development database script or integration tests at a production database.

Configuration:

- `MONGODB_URI`, `MONGODB_DB`: server-only MongoDB connection.
- `NEXT_PUBLIC_SITE_URL`: exact external origin used for canonicals and same-origin write checks.
- `DEMO_CONTENT`: keep `true` on a development/demo deployment. Set `false` for a genuine public marketplace and remove sample records from that database.
- `RESEND_API_KEY`, `EMAIL_FROM`: verified email delivery provider and sender. Production account/guest verification requires these; local development explicitly displays a verification link instead of claiming to send email.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google Identity Services web client. Configure its authorized JavaScript origin to match the site. The application renders the Google button/One Tap only when configured and validates issuer, audience, signature and verified email server-side. Existing password accounts are not silently linked by email.
- `TRUST_PROXY`: enable only when a trusted ingress overwrites `X-Forwarded-For`. Otherwise rate limits use a shared bucket, which is conservative but unsuitable for busy production traffic.

HTTPS is required for secure production session cookies. Configure TLS, database backups, email-domain authentication, deployment monitoring and a trusted ingress before launch.

## Implementation details

- Opaque session cookies; only SHA-256 session digests persist in MongoDB. Passwords use salted scrypt hashes.
- Origin checks on every mutation, role checks, owner-scoped updates, Zod allowlists, plain-text validation, bounded upload reads, image decoding and server-side compression.
- MongoDB stores compressed WebP photos behind opaque routes. Unpublished images require uploader ownership or an admin session. Approved photos are publicly cacheable for one hour. Use object storage/CDN for large deployments; caching must be purged when rapid content removal is required.
- A moderation decision and its audit entry update the same listing document atomically. Reviewer version checks reject stale UI decisions. Notifications are separate writes; a production outbox would strengthen delivery guarantees.
- Discovery only queries approved listings. Pending/rejected/suspended records have no public detail page. Quality checks and explicit noindex prevent demo/private/thin pages from entering listing sitemaps.
- Sitemaps split listings into groups of 5,000, include primary images and omit admin, accounts, pending content and filter permutations.
- The location catalog includes all nine provinces and 25 districts. Submissions accept city/town and area text within a validated province/district pair. Curated discovery landing pages currently cover six cities; adding authoritative city records extends that catalog.
- No payments, bookings, invented ratings or fabricated traffic statistics are enabled. Optional Google AdSense requires explicit deployment configuration; default and development builds do not load ads.

## Verification

```bash
# Starts its own temporary MongoDB and an isolated Next.js development server.
# Uses the downloaded MongoDB binary cache; never uses the configured live DB.
bun run test:integration

# Against the running localhost:3000 preview database.
# Override TEST_BASE_URL or CHROME_PATH if needed.
bun run test:ui
```

Integration coverage includes registration, role injection, session privacy, private image access, image-content validation, guest submissions, email verification, approval gates, true 404 handling, sitemap/structured-data rules, owner access, date filtering, favorites, inquiries, reporting, re-review, audit history, logout and rate limiting. Browser checks cover navigation, filtering, saving, preview moderation, submission controls, mobile overflow and automated WCAG A/AA checks.

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the architecture and [docs/LAUNCH-READINESS.md](docs/LAUNCH-READINESS.md) for the remaining production work. Automated checks do not establish legal compliance, AdSense approval, real property verification, production load capacity or live provider delivery.
