import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "@/components/site-link";
import { policies } from "@/lib/editorial";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) notFound();
  return pageMetadata(
    `${slug.charAt(0).toUpperCase() + slug.slice(1)} policy`,
    p.intro,
    `/policies/${slug}`,
  );
}
export default async function Policy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) notFound();
  return (
    <main className="container">
      <div className="page-top">
        <span className="eyebrow">A LITTLE PEACE OF MIND</span>
        <h1>{p.title}</h1>
        <p>{p.intro}</p>
      </div>
      <article className="prose">
        {p.sections.map(([h, t]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{t}</p>
          </section>
        ))}
        <p>
          Questions? <Link href="/contact">Get in touch</Link>.
        </p>
        <div className="popular-searches">
          <div>
            {Object.entries(policies)
              .filter(([s]) => s !== slug)
              .map(([s]) => (
                <Link key={s} href={`/policies/${s}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Link>
              ))}
          </div>
        </div>
      </article>
    </main>
  );
}
