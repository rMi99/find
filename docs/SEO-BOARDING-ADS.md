# Boarding, content SEO and Google AdSense

## Boarding rooms

Choose **Boarding** when submitting a place. The form selects **Rent** with **monthly pricing**. Describe one room or shared-room offer; create separate listings for different rooms or prices.

- Audience: women, men, couples or any adults.
- Room: private or shared; students, professionals or either.
- Capacity: any whole number from 1 to 30 people; couples require capacity of at least 2.
- Vacancies: 0 through capacity. These count people, including couples. A three-person room can have one free space; a six-person room can have six, two or none.
- Price: per person per month or per entire room per month.

New listings require verified contact details, photos, a useful description and admin approval. The admin review modal shows the boarding arrangement. Owners can change the arrangement through **My listings → Edit**; these edits return the listing to review. Use **Availability** to update free spaces without re-review. A full room must be marked unavailable. Server validation and ownership checks apply to every update; simultaneous updates cannot silently overwrite another change.

Search supports audience, private/shared, exact people per room, minimum available spaces and price basis. To find a room for three friends, request three available spaces. To find a three-person room with space for one newcomer, choose capacity three and one available space. Availability remains owner supplied and should be confirmed directly.

Public discovery pages:

- `/boarding-houses`
- `/boarding-for-women`
- `/boarding-for-men`
- `/boarding-for-couples`
- City variants such as `/boarding-for-women/colombo`
- `/guides/boarding-house-checklist`

## Content and SEO

All 17 categories now have specific comparison guidance and questions. The boarding guide explains occupancy, shared facilities, pricing, bills, viewings, house rules and couple arrangements. Its worked price calculation is explicitly an example, not a market estimate. Public collections, locations, guides, policies, home, about and contact pages have canonical URLs and descriptive metadata. Discovery pages and articles provide internal links to related content; article and listing pages include breadcrumb structured data, and guides include Article data without fabricated dates or reviews.

Indexing is deliberate:

- Sample listings, unapproved listings and owner-excluded listings stay out of listing sitemaps.
- A discovery page needs at least three matching, approved, real listings meeting the existing content/contact/photo checks. Audience-specific boarding collections count only that audience. Empty and sparse pages are `noindex, follow`.
- Search/filter query permutations remain `noindex` and are omitted from sitemaps.
- Original editorial guides may be indexed without property inventory. `DEMO_CONTENT=true` disables their indexing too.
- The sitemap includes qualifying collection roots and city variants; no artificial city or group-size permutations are generated.
- Private account and administrative routes retain their crawler exclusions and authorization controls.

The three-listing threshold is an application quality rule, not a promise about search-engine treatment. Continue improving real owner descriptions and photographs, and verify indexing and Core Web Vitals after launch. Guidance follows Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and avoids [doorway pages](https://developers.google.com/search/blog/2015/03/an-update-on-doorway-pages).

## Auto ads activation

Auto ads is **off by default**. No publisher ID has been supplied or live account connected. Add these settings to the deployment environment before building and starting the app:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-real-domain.example
DEMO_CONTENT=false
ADSENSE_PUBLISHER_ID=your-approved-ca-pub-id
ADSENSE_ENABLED=false
ADSENSE_PRIVACY_READY=false
```

Use your actual `ca-pub-` ID followed by 16 digits. Invalid IDs and the all-zero placeholder are rejected. The public ID is used for the account-verification meta tag and `/ads.txt` even while serving is disabled. Check the generated `ads.txt` line against your account's exact instructions. See [AdSense site connection](https://support.google.com/adsense/answer/7584263?hl=en).

Before setting both flags to `true`:

1. Complete site/account review in AdSense. Finalize the real operator's identity, contact details, policy text and content permissions.
2. Configure and publish **Google Privacy & Messaging** for the applicable regions, including a certified CMP setup where Google requires it. This implementation uses Google's messages deployed through the AdSense tag; it does not implement a separate consent-management platform. `ADSENSE_PRIVACY_READY` is an operator confirmation, not an automatic consent or compliance check. See [Google CMP requirements](https://support.google.com/adsense/answer/13554020?hl=en-GB) and the [Privacy & Messaging API](https://developers.google.com/funding-choices/fc-api-docs).
3. Enable Auto ads in the account, preview placements on mobile and desktop, and configure page exclusions. Exclude `/admin`, `/dashboard`, `/login`, `/register`, `/submit`, `/verify`, `/contact`, `/policies`, `/api`, `/explore` and preview, empty or disallowed pages. Do not rely on query parameters in an exclusion; [Google's exclusions](https://support.google.com/adsense/answer/9262311?hl=en) do not support them.
4. Set `ADSENSE_ENABLED=true` and `ADSENSE_PRIVACY_READY=true`, then rebuild/redeploy with the same environment used at runtime. CSP and static metadata depend on build configuration. The loader additionally requires production mode, a public HTTPS origin and demo mode off.
5. Check real requests, privacy-message behavior, accept/reject/revisit flows and CSP reports in each applicable region. Use the footer's **Advertising privacy settings** on an ad-supported page to reopen Google's available choices. Validate the final UI with actual ads and check layout stability.

The tag loads lazily on eligible home/discovery/listing pages and original guide articles. It is not included on account pages, submission forms, filtered search, contact, policy, empty, sample or noindex discovery/detail pages. Sparse collections do not request ads. With ads enabled, site links and homepage search use full-document navigation: this destroys the previous page's ad runtime before entering an excluded route. Without ads, normal Next.js navigation remains enabled.

The AdSense dashboard controls density, formats, exclusions and placement. Keep ads clear of forms, navigation and contact actions. Use the [Auto ads setup guide](https://support.google.com/adsense/answer/9261307?hl=en) to review those controls. The application does not promise account approval, ad fill, income or ranking. A live provider/CMP and real ad creative test remains outstanding.

## Verification commands

```bash
bunx tsx scripts/seo-ads-check.mts
bun run test:integration
bun run test:ui
bun run typecheck
bun run lint
bun run build
```

The integration suite uses its own temporary MongoDB and server. It covers submission validation, publishing, private ownership, 0/full vacancies, women/men/couple rules, room-size changes, search, and audience-specific sitemap gates. UI tests exercise the actual responsive form and public pages, metadata and disabled-ad network behavior. Configuration checks cover the production/domain/publisher/privacy switches without contacting Google.
