import { db, configured } from "@/lib/db";
import {
  eligibleQuery,
  indexingEnabled,
  siteUrl,
  xmlResponse,
  xmlEscape,
} from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  let files: string[] = [];
  if (indexingEnabled()) {
    const count = configured()
      ? await (await db()).collection("listings").countDocuments(eligibleQuery)
      : 0;
    files = [
      "static.xml",
      "discovery.xml",
      ...Array.from(
        { length: Math.ceil(count / 5000) },
        (_, i) => `listings-${i}.xml`,
      ),
    ];
  }
  return xmlResponse(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${files.map((f) => `<sitemap><loc>${xmlEscape(`${siteUrl()}/sitemaps/${f}`)}</loc></sitemap>`).join("")}</sitemapindex>`,
  );
}
