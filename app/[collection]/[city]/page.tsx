import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Browse } from "@/components/browse";
import { collections, locations, collectionFilters } from "@/lib/catalog";
import { slugify } from "@/lib/types";
import { canIndexDiscovery } from "@/lib/seo";
type Props = { params: Promise<{ collection: string; city: string }> };
async function context({ params }: Props) {
  const { collection, city } = await params;
  return {
    collection,
    city,
    c: Object.hasOwn(collections, collection)
      ? collections[collection]
      : undefined,
    l: locations.find((l) => slugify(l.city) === city),
  };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { collection, city, c, l } = await context(props);
  if (!c || !l) return {};
  const indexable = await canIndexDiscovery(collectionFilters(c, l.city));
  return pageMetadata(
    `${c.label} in ${l.city}`,
    `Compare ${c.label.toLowerCase()} in ${l.city}. Check prices, facilities and availability, then contact the owner directly.`,
    `/${collection}/${city}`,
    indexable,
    l.image,
  );
}
export default async function Collection(props: Props) {
  const { c, l } = await context(props);
  if (!c || !l) notFound();
  return (
    <Browse
      filters={collectionFilters(c, l.city)}
      title={`${c.label} in ${l.city}.`}
      description={l.description}
      locked
    />
  );
}
