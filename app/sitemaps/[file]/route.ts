import {
  eligibleListings,
  indexingEnabled,
  siteUrl,
  xmlResponse,
  xmlEscape,
  eligibleQuery,
  discoveryQuery,
  canIndexDiscovery,
} from "@/lib/seo";
import { guides, policies } from "@/lib/editorial";
import { categoryNames, slugify } from "@/lib/types";
import { collections, locations, collectionFilters } from "@/lib/catalog";
import { configured, db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const urls: { path: string; updated?: string; image?: string }[] = [];
  if (!/^(static|discovery|listings-\d+)\.xml$/.test(file))
    return new Response("Not found", { status: 404 });
  if (indexingEnabled()) {
    if (file === "static.xml")
      urls.push(
        ...[
          "",
          "/about",
          "/contact",
          "/guides",
          ...guides.map((g) => `/guides/${g.slug}`),
          ...Object.keys(policies).map((p) => `/policies/${p}`),
        ].map((path) => ({ path })),
      );
    else if (file === "discovery.xml" && configured()) {
      const c = (await db()).collection("listings");
      for (const l of locations) {
        if (
          (await c.countDocuments(
            { ...eligibleQuery, city: l.city },
            { limit: 3 },
          )) >= 3
        )
          urls.push({ path: `/city/${slugify(l.city)}` });
        for (const [slug, collection] of Object.entries(collections))
          if (
            (await c.countDocuments(
              {
                ...eligibleQuery,
                city: l.city,
                ...discoveryQuery(collectionFilters(collection)),
              },
              { limit: 3 },
            )) >= 3
          )
            urls.push({ path: `/${slug}/${slugify(l.city)}` });
      }
      for (const [slug, collection] of Object.entries(collections))
        if (await canIndexDiscovery(collectionFilters(collection)))
          urls.push({ path: `/${slug}` });
      for (const category of categoryNames)
        if (
          (await c.countDocuments(
            { ...eligibleQuery, category },
            { limit: 3 },
          )) >= 3
        )
          urls.push({ path: `/category/${slugify(category)}` });
    } else if (file.startsWith("listings-")) {
      const page = Number(file.slice(9, -4));
      if (page > 100000) return new Response("Not found", { status: 404 });
      const listings = await eligibleListings(page * 5000);
      urls.push(
        ...listings.map((l) => ({
          path: `/places/${l.slug}`,
          updated: l.updatedAt,
          image: l.images[0],
        })),
      );
    }
  }
  return xmlResponse(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.map((u) => `<url><loc>${xmlEscape(siteUrl() + u.path)}</loc>${u.updated ? `<lastmod>${xmlEscape(u.updated)}</lastmod>` : ""}${u.image ? `<image:image><image:loc>${xmlEscape(siteUrl() + u.image)}</image:loc></image:image>` : ""}</url>`).join("")}</urlset>`,
  );
}
