import { notFound } from "next/navigation";
import { Browse } from "@/components/browse";
import { collections, collectionFilters } from "@/lib/catalog";
import { categoryContent } from "@/lib/discovery-content";
import { canIndexDiscovery } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
type Props = { params: Promise<{ collection: string }> };
export async function generateMetadata({ params }: Props) {
  const { collection } = await params;
  const c = Object.hasOwn(collections, collection)
    ? collections[collection]
    : undefined;
  if (!c) notFound();
  return pageMetadata(
    `${c.label} in Sri Lanka`,
    categoryContent[c.category].intro,
    `/${collection}`,
    await canIndexDiscovery(collectionFilters(c)),
  );
}
export default async function Collection({ params }: Props) {
  const { collection } = await params;
  const c = Object.hasOwn(collections, collection)
    ? collections[collection]
    : undefined;
  if (!c) notFound();
  return (
    <Browse
      filters={collectionFilters(c)}
      title={`${c.label} in Sri Lanka`}
      description={categoryContent[c.category].intro}
      locked
    />
  );
}
