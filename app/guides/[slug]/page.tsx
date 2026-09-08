import { pageMetadata } from "@/lib/metadata";
import { AutoAds } from "@/components/auto-ads";
import { indexingEnabled, siteUrl } from "@/lib/seo";
import { StructuredData, breadcrumbData } from "@/components/structured-data";
import { notFound } from "next/navigation";
import Link from "@/components/site-link";
import Image from "next/image";
import { guides } from "@/lib/editorial";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = guides.find((g) => g.slug === slug);
  if (!g) notFound();
  return {
    ...pageMetadata(g.title, g.description, `/guides/${slug}`, true, g.image),
    openGraph: {
      ...pageMetadata(g.title, g.description, `/guides/${slug}`, true, g.image)
        .openGraph,
      type: "article",
    },
  };
}
export default async function Guide({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = guides.find((g) => g.slug === slug);
  if (!article) notFound();
  return (
    <main className="container">
      <AutoAds eligible={indexingEnabled()} />
      {indexingEnabled() && (
        <StructuredData
          value={[
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.description,
              image: `${siteUrl()}${article.image}`,
              mainEntityOfPage: `${siteUrl()}/guides/${slug}`,
              author: {
                "@type": "Organization",
                name: "Ceylon",
                url: `${siteUrl()}/about`,
              },
              inLanguage: "en-LK",
              articleSection: article.category,
            },
            breadcrumbData(siteUrl(), [
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides" },
              { name: article.title, path: `/guides/${slug}` },
            ]),
          ]}
        />
      )}
      <div className="page-top">
        <span className="eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
      </div>
      <div className="detail-gallery" style={{ height: 380 }}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          preload
          sizes="90vw"
        />
      </div>
      <article className="prose">
        {slug === "boarding-house-checklist" && (
          <p>
            <Link href="/boarding-houses">Browse boarding houses</Link> ·{" "}
            <Link href="/boarding-for-women">For women</Link> ·{" "}
            <Link href="/boarding-for-men">For men</Link> ·{" "}
            <Link href="/boarding-for-couples">For couples</Link>
          </p>
        )}
        {article.sections.map(([h, p]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{p}</p>
          </section>
        ))}
        <p>
          <Link href="/explore">Find your next place</Link> ·{" "}
          <Link href="/guides">More from the local edit</Link>
        </p>
      </article>
    </main>
  );
}
