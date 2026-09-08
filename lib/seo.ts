import { db, configured } from "./db";
import { type Listing } from "./types";
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";
export const indexingEnabled = () =>
  Boolean(process.env.NEXT_PUBLIC_SITE_URL) &&
  process.env.DEMO_CONTENT !== "true";
export const eligibleQuery = {
  status: "approved" as const,
  demo: { $ne: true },
  contactVerified: true,
  "seo.noindex": { $ne: true },
  "images.0": { $exists: true },
  $expr: { $gte: [{ $strLenCP: "$description" }, 100] },
};
export async function eligibleListings(offset = 0, limit = 5000) {
  return configured()
    ? (await db())
        .collection<Listing>("listings")
        .find(eligibleQuery)
        .sort({ _id: 1 })
        .skip(offset)
        .limit(limit)
        .toArray()
    : [];
}
export function discoveryQuery(filters: Record<string, string>) {
  const { audience, ...rest } = filters;
  return { ...rest, ...(audience ? { "boarding.audience": audience } : {}) };
}
export async function canIndexDiscovery(filters: Record<string, string>) {
  if (!indexingEnabled() || !configured()) return false;
  return (
    (await (
      await db()
    )
      .collection<Listing>("listings")
      .countDocuments(
        { ...eligibleQuery, ...discoveryQuery(filters) },
        { limit: 3 },
      )) >= 3
  );
}
export const xmlEscape = (text: string) =>
  text.replace(
    /[<>&'\"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c]!,
  );
export function xmlResponse(body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
