# Launch readiness and remaining requirements

This repository implements an operational marketplace core, not an externally approved or fully operated public business. The attached specification also describes later-stage capabilities that require product decisions, provider credentials or further implementation.

## Implemented and locally testable

- Responsive public marketplace, search, property pages and working user/admin workspaces.
- MongoDB persistence, indexes, registration, login, opaque sessions, role checks and own-listing management.
- Google Identity Services button/One Tap integration, activated by a configured client ID; external provider flow still needs live verification.
- Guest listing creation, email verification and approval-only publication.
- Multi-photo drag/drop upload, progress, previews, duplicate detection, cover selection, ordering, deletion, dimension validation, safe IDs and server-side WebP conversion. Next Image negotiates modern formats for bundled public imagery.
- Price/category/purpose/location/facility/bedroom/guest/date search, sorting and public pagination.
- Owner-managed availability and explicit unavailable dates.
- Configurable boarding rooms for women, men, couples and any adults, including capacity, vacancies and monthly price basis; dedicated discovery pages and an original viewing guide.
- Optional AdSense Auto ads loader, account verification, ads.txt, privacy-message readiness gate and document navigation to protect excluded routes. Disabled by default; live provider behavior is unverified.
- Administrator approval, rejection, changes requested, suspension, soft deletion, featuring, verification evidence, SEO controls and decision history.
- Saved places, owner inquiries, listing reports, notifications and an operator message inbox.
- Original guides, policies, metadata, structured data, sitemap index with listing images, robots and noindex protection.
- All provinces/districts in the form; six curated city discovery pages.

## Required configuration and operational decisions

- Real MongoDB deployment, credentials, indexes, backups, monitoring and recovery rehearsal.
- Public domain/TLS and a trusted reverse proxy with correctly enforced request-size/IP headers.
- Google web-client configuration and live browser sign-in verification.
- Resend sender/domain credentials and live verification-email delivery testing.
- Legal business identity, address, operator support process, jurisdiction, final privacy/terms and retention/deletion procedure. Current policy copy explicitly identifies its development status.
- Real property submissions and a staffed verification/moderation process. Remove sample data before launch.
- Asset-license review and replacement of sample property photos with owner-authorized photography.
- Security review, traffic/load tests and field Core Web Vitals measurement.

## Extended features not yet implemented

- A complete authoritative city/town/area gazetteer, editable catalog administration, geospatial/radius queries and province/district landing pages.
- Full booking calendars, date ranges/check-in/check-out rules, reservations and payment processing. Current date availability is an exact-day exclusion system, and inquiries do not create bookings.
- Dedicated purchase/wanted property attributes, land area/title verification, venue package editors and advanced seller-type filters.
- Administrator editing of every listing field and photos; current administrators review, moderate and edit SEO while owners edit primary content.
- Cross-account guest-listing claiming and self-service password reset/account deletion.
- Email delivery of inquiries to guest hosts who have no dashboard; these require a registered owner before inquiries can be enabled.
- Automated duplicate/scam classification, configurable CAPTCHA challenges and an abuse operations queue. Current controls are validation, honeypots, quotas, manual moderation and reports.
- Public review submission and moderation, paid promotions, ad-campaign management and commercial billing. No review or ad UI pretends these exist.
- GA/GTM/Search Console/error-monitoring integrations and consent management for optional trackers.
- An object-storage/CDN adapter, asynchronous image jobs, upload orphan cleanup and resilient notification/email outbox.
- Full administrative cursor pagination/analytics at large scale. Current administrative views explicitly show the latest 100 records and overview values derive from those records; public search is paginated. Claims of million-listing capacity require additional work and load evidence.
- Strict nonce-based CSP (the current Next-compatible policy allows inline/eval scripts), per-user distributed abuse limits at ingress, externally audited RBAC and account-recovery processes.
- Search redirects and 410 tombstones; withdrawn listings currently return 404.

## SEO and AdSense review

The build prepares useful content and crawl controls. It does not guarantee indexing or AdSense eligibility. Sample listings have no fake ratings and are not indexable. Filter combinations are not in the sitemap; real discovery pages need at least three relevant approved listings before indexing. Private APIs require authorization regardless of crawler directives.

Before applying for advertising, finalize the operator identity and policy content, establish a genuine supply of useful approved listings, verify original content/photography permissions, moderate UGC continuously and validate the live site against the provider's current requirements. No advertising scripts run by default. The optional AdSense integration requires a real publisher ID, production HTTPS, published Google privacy messages and explicit enabling flags. See [SEO, boarding and Auto ads setup](SEO-BOARDING-ADS.md).
