import { configured, db } from "./db";
import { demoListings } from "./demo";
import { type Listing, type SearchFilters, publicListing } from "./types";
import type { Filter, Sort } from "mongodb";
export function canIndex(l: Listing) {
  return (
    process.env.DEMO_CONTENT !== "true" &&
    Boolean(process.env.NEXT_PUBLIC_SITE_URL) &&
    l.status === "approved" &&
    !l.demo &&
    !l.seo?.noindex &&
    l.contactVerified &&
    l.description.length >= 100 &&
    l.images.length > 0
  );
}
export const previewMode = () =>
  (!configured() && process.env.NODE_ENV !== "production") ||
  process.env.DEMO_CONTENT === "true";
export async function searchListings(filters: SearchFilters = {}) {
  const page = Math.max(1, Math.min(10000, Number(filters.page) || 1));
  const limit = 12;
  if (!configured()) {
    let list = previewMode() ? [...demoListings] : [];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((l) =>
        `${l.title} ${l.city} ${l.category}`.toLowerCase().includes(q),
      );
    }
    for (const key of [
      "purpose",
      "category",
      "city",
      "province",
      "district",
    ] as const)
      if (filters[key])
        list = list.filter(
          (l) => l[key].toLowerCase() === filters[key]!.toLowerCase(),
        );
    for (const key of ["audience", "roomType", "priceBasis"] as const)
      if (filters[key])
        list = list.filter((l) => l.boarding?.[key] === filters[key]);
    if (filters.capacity)
      list = list.filter(
        (l) => l.boarding?.capacity === Number(filters.capacity),
      );
    if (filters.vacancies)
      list = list.filter(
        (l) =>
          l.available &&
          (l.boarding?.vacancies || 0) >= Number(filters.vacancies),
      );
    if (filters.min) list = list.filter((l) => l.price >= Number(filters.min));
    if (filters.max) list = list.filter((l) => l.price <= Number(filters.max));
    if (filters.bedrooms)
      list = list.filter((l) => l.bedrooms >= Number(filters.bedrooms));
    if (filters.guests)
      list = list.filter((l) => l.guests >= Number(filters.guests));
    if (filters.amenity)
      list = list.filter((l) => l.amenities.includes(filters.amenity!));
    if (filters.verified === "true") list = list.filter((l) => l.verified);
    if (filters.featured === "true") list = list.filter((l) => l.featured);
    if (filters.available === "true" || filters.date)
      list = list.filter(
        (l) =>
          l.available &&
          (!filters.date ||
            (!l.blockedDates.includes(filters.date) &&
              (!l.availableFrom || l.availableFrom <= filters.date))),
      );
    if (filters.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-desc")
      list.sort((a, b) => b.price - a.price);
    else if (filters.sort === "newest")
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      listings: list.slice((page - 1) * limit, page * limit).map(publicListing),
      total: list.length,
      page,
      pages: Math.ceil(list.length / limit),
      preview: true,
    };
  }
  const query: Filter<Listing> = { status: "approved" };
  for (const key of [
    "purpose",
    "category",
    "city",
    "province",
    "district",
  ] as const)
    if (filters[key]) query[key] = filters[key];
  for (const key of ["audience", "roomType", "priceBasis"] as const)
    if (filters[key]) query[`boarding.${key}`] = filters[key];
  if (filters.capacity)
    query["boarding.capacity"] = Number(filters.capacity) || 0;
  if (filters.vacancies) {
    query["boarding.vacancies"] = {
      $gte: Math.max(1, Number(filters.vacancies) || 1),
    };
    query.available = true;
  }
  if (filters.q) query.$text = { $search: filters.q.slice(0, 120) };
  if (filters.min || filters.max) {
    query.price = {};
    if (filters.min && Number.isFinite(Number(filters.min)))
      query.price.$gte = Number(filters.min);
    if (filters.max && Number.isFinite(Number(filters.max)))
      query.price.$lte = Number(filters.max);
  }
  if (filters.bedrooms)
    query.bedrooms = { $gte: Number(filters.bedrooms) || 0 };
  if (filters.guests) query.guests = { $gte: Number(filters.guests) || 0 };
  if (filters.amenity) query.amenities = filters.amenity;
  if (filters.verified === "true") query.verified = true;
  if (filters.featured === "true") query.featured = true;
  if (filters.available === "true" || filters.date) query.available = true;
  if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
    query.blockedDates = { $ne: filters.date };
    query.$or = [
      { availableFrom: { $exists: false } },
      { availableFrom: "" },
      { availableFrom: { $lte: filters.date } },
    ];
  }
  const sort: Sort =
    filters.sort === "price-asc"
      ? { price: 1 }
      : filters.sort === "price-desc"
        ? { price: -1 }
        : filters.sort === "newest"
          ? { createdAt: -1 }
          : { featured: -1, createdAt: -1 };
  const c = (await db()).collection<Listing>("listings");
  const [listings, total] = await Promise.all([
    c
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    c.countDocuments(query),
  ]);
  return {
    listings: listings.map(publicListing),
    total,
    page,
    pages: Math.ceil(total / limit),
    preview: listings.some((l) => l.demo),
  };
}
export async function getListing(slug: string) {
  if (!configured())
    return previewMode()
      ? demoListings.find((l) => l.slug === slug) || null
      : null;
  return (await db())
    .collection<Listing>("listings")
    .findOne({ slug, status: "approved" });
}
