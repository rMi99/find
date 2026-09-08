import Link from "@/components/site-link";
import { discoveryContent } from "@/lib/discovery-content";
import { collections, locations } from "@/lib/catalog";
import { slugify, type SearchFilters } from "@/lib/types";
export function DiscoveryEditorial({ filters }: { filters: SearchFilters }) {
  const content = discoveryContent(filters);
  const related = Object.entries(collections).filter(
    ([, c]) => !filters.category || c.category === filters.category,
  );
  return (
    <section className="discovery-editorial">
      <span className="eyebrow">A MORE INFORMED SEARCH</span>
      <h2>{content.title}</h2>
      <p>{content.intro}</p>
      <p>{content.check}</p>
      {content.local && <p>{content.local}</p>}
      <h3>{content.question}</h3>
      <p>{content.answer}</p>
      <Link
        className="text-link"
        href={
          filters.category === "Boarding"
            ? "/guides/boarding-house-checklist"
            : "/guides/renting-with-confidence"
        }
      >
        Read the full viewing checklist →
      </Link>
      <h3>Continue exploring</h3>
      <div className="discovery-links">
        {related.map(([slug, c]) => (
          <Link
            key={slug}
            href={`/${slug}${filters.city ? `/${slugify(filters.city)}` : ""}`}
          >
            {c.label}
            {filters.city ? ` in ${filters.city}` : ""}
          </Link>
        ))}
        {filters.category === "Boarding" &&
          locations.map((l) => (
            <Link key={l.city} href={`/boarding-houses/${slugify(l.city)}`}>
              Boarding in {l.city}
            </Link>
          ))}
      </div>
    </section>
  );
}
