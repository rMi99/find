import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Browse } from "@/components/browse";
import { locations } from "@/lib/catalog";
import { slugify } from "@/lib/types";
import { canIndexDiscovery } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = locations.find((l) => slugify(l.city) === slug);
  if (!l) return {};
  const indexable = await canIndexDiscovery({ city: l.city });
  return pageMetadata(
    `Homes, boarding & stays in ${l.city}`,
    l.description,
    `/city/${slug}`,
    indexable,
    l.image,
  );
}
export default async function City({ params }: Props) {
  const { slug } = await params;
  const l = locations.find((l) => slugify(l.city) === slug);
  if (!l) notFound();
  return (
    <Browse
      filters={{ city: l.city }}
      title={`Find your somewhere in ${l.city}.`}
      description={l.description}
      locked
    />
  );
}
