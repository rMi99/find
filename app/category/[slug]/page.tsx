import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categoryContent } from "@/lib/discovery-content";
import { Browse } from "@/components/browse";
import { categoryNames, slugify } from "@/lib/types";
import { canIndexDiscovery } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryNames.find((c) => slugify(c) === slug);
  if (!category) return {};
  const indexable = await canIndexDiscovery({ category });
  return pageMetadata(
    `${category === "Boarding" ? "Boarding houses" : `${category} listings`} in Sri Lanka`,
    categoryContent[category].intro,
    `/category/${slug}`,
    indexable,
  );
}
export default async function Category({ params }: Props) {
  const { slug } = await params;
  const category = categoryNames.find((c) => slugify(c) === slug);
  if (!category) notFound();
  return (
    <Browse
      filters={{ category }}
      title={`${category === "Boarding" ? "Boarding houses" : `${category} listings`} in Sri Lanka`}
      description={categoryContent[category].intro}
      locked
    />
  );
}
