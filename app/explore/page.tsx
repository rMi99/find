import type { Metadata } from "next";
import { Browse } from "@/components/browse";
import type { SearchFilters } from "@/lib/types";
export const metadata: Metadata = {
  title: "Explore places in Sri Lanka",
  description:
    "Search homes, boarding rooms, holiday stays and day-out places in Sri Lanka by location, budget, facilities and available spaces.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/explore" },
};
export default async function Explore({
  searchParams,
}: {
  searchParams: Promise<SearchFilters>;
}) {
  const raw = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => typeof v === "string"),
  ) as SearchFilters;
  return <Browse filters={filters} />;
}
